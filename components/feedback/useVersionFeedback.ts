import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  adminGetVersionFeedback,
  authorGetVersionFeedback,
  adminSendVersionFeedback,
  authorSendVersionFeedback,
  adminReadVersionFeedback,
  authorReadVersionFeedback,
  adminSetVersionFeedbackState,
  type FeedbackMessageInput,
  type AdminGetVersionFeedbackParams,
  type FeedbackStateInput,
  type FeedbackReadInput,
  type FeedbackResponse,
} from '@/src/api/feedback.generated'
import {
  PRIVATE_REGISTRY_KEY,
  privateQueryOptions,
  privateMutationOptions,
  isPrivateRegistryAccessDenied,
  clearPrivateRegistryCache,
} from '@/src/api/privateRegistry'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { usePrivateQueryRemoval } from '@/src/hooks/usePrivateQueryRemoval'

import { mergeFeedbackPages, sameFeedbackTarget } from './feedback.behavior'

export const privateFeedbackEnabled =
  process.env.NEXT_PUBLIC_PRIVATE_VERSION_FEEDBACK_ENABLED === 'true'
export type FeedbackTarget = {
  nodeId: string
  versionId: string
  publisherId?: string
  role: 'admin' | 'author'
  threadId?: string
}
export function useVersionFeedback(target: FeedbackTarget) {
  const [user] = useFirebaseUser()
  const client = useQueryClient()
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [historyError, setHistoryError] = useState<unknown>(null)
  const scope = useMemo(
    () => [PRIVATE_REGISTRY_KEY, user?.uid, target.role],
    [user?.uid, target.role]
  )
  const key = useMemo(
    () => [
      ...scope,
      target.nodeId,
      target.versionId,
      target.publisherId,
      ...(target.threadId ? [target.threadId] : []),
    ],
    [
      scope,
      target.nodeId,
      target.versionId,
      target.publisherId,
      target.threadId,
    ]
  )
  const [blocked, setBlocked] = usePrivateQueryRemoval(key)
  const getFeedback = (
    params?: AdminGetVersionFeedbackParams,
    signal?: AbortSignal
  ) =>
    target.role === 'admin'
      ? adminGetVersionFeedback(
          target.nodeId,
          target.versionId,
          params,
          undefined,
          signal
        )
      : authorGetVersionFeedback(
          target.publisherId!,
          target.nodeId,
          target.versionId,
          params,
          undefined,
          signal
        )
  const query = useQuery({
    ...privateQueryOptions,
    queryKey: key,
    enabled: !!user && !!target.versionId && !blocked,
    queryFn: async ({ signal }) => {
      const incoming = await getFeedback(undefined, signal)
      // A reference must never redirect to a new Publisher's conversation after transfer.
      // A mismatch is a bad/stale reference, not evidence of global access revocation.
      if (
        target.threadId &&
        (incoming.thread?.id !== target.threadId ||
          incoming.target.publisher_id !== target.publisherId)
      ) {
        throw new Error('FEEDBACK_REFERENCE_UNAVAILABLE')
      }
      return mergeFeedbackPages(
        client.getQueryData<FeedbackResponse>(key),
        incoming
      )
    },
  })
  const refresh = () =>
    client.invalidateQueries({
      queryKey: [PRIVATE_REGISTRY_KEY, user?.uid],
      // A user may have both an owner inbox and an admin conversation mounted.
      predicate: ({ queryKey }) =>
        queryKey[3] === 'inbox' ||
        (queryKey[3] === target.nodeId && queryKey[4] === target.versionId),
    })
  const writeOptions = {
    ...privateMutationOptions,
    mutationKey: [...key, 'write'],
    onSuccess: refresh,
  }
  const send = useMutation({
    ...writeOptions,
    onSuccess: () =>
      Promise.all([
        refresh(),
        // Only messages change the admin handling filter's latest sender.
        client.invalidateQueries({
          queryKey: [
            PRIVATE_REGISTRY_KEY,
            user?.uid,
            'admin',
            'admin-versions',
          ],
        }),
      ]),
    mutationFn: (data: FeedbackMessageInput) =>
      target.role === 'admin'
        ? adminSendVersionFeedback(target.nodeId, target.versionId, data)
        : authorSendVersionFeedback(
            target.publisherId!,
            target.nodeId,
            target.versionId,
            data
          ),
  })
  const state = useMutation({
    ...writeOptions,
    mutationFn: (data: FeedbackStateInput) =>
      adminSetVersionFeedbackState(target.nodeId, target.versionId, data),
  })
  const read = useMutation({
    ...writeOptions,
    mutationFn: (data: FeedbackReadInput) =>
      target.role === 'admin'
        ? adminReadVersionFeedback(target.nodeId, target.versionId, data)
        : authorReadVersionFeedback(
            target.publisherId!,
            target.nodeId,
            target.versionId,
            data
          ),
  })
  const denied = [
    query.error,
    send.error,
    state.error,
    read.error,
    historyError,
  ].some(isPrivateRegistryAccessDenied)
  useEffect(() => {
    if (!denied) return
    setBlocked(true)
    // A concealed 404 may mean role/ownership revocation. Apply the same
    // role-scoped cleanup as the inbox, including mounted summaries and scans.
    clearPrivateRegistryCache(client, scope)
  }, [denied, client, scope, setBlocked])
  const retry = async () => {
    const result = await query.refetch()
    if (result.isSuccess) {
      send.reset()
      state.reset()
      read.reset()
      setHistoryError(null)
      setBlocked(false)
    }
  }
  const data = query.data
  const loadOlder = async () => {
    if (!data?.next_before_seq || loadingOlder) return
    setLoadingOlder(true)
    try {
      const params = { before_seq: data.next_before_seq }
      const result = await getFeedback(params)
      const current = client.getQueryData<FeedbackResponse>(key)
      // An in-flight history request must not restore a previous recipient's data.
      if (!current || !sameFeedbackTarget(current.target, data.target)) return
      if (!sameFeedbackTarget(result.target, data.target)) {
        await refresh()
        return
      }
      client.setQueryData<FeedbackResponse>(key, (previous) =>
        previous && sameFeedbackTarget(previous.target, data.target)
          ? mergeFeedbackPages(result, previous)
          : previous
      )
    } catch (error) {
      setHistoryError(error)
      throw error
    } finally {
      setLoadingOlder(false)
    }
  }
  return {
    query,
    data,
    send,
    state,
    read,
    loadOlder,
    loadingOlder,
    userId: user?.uid,
    accessDenied: blocked || denied,
    retry,
  }
}
