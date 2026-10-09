import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { pageFlow } from 'sflow'
import {
  adminListVersionFeedback,
  authorListVersionFeedback,
  type AuthorListVersionFeedbackParams,
  type FeedbackInbox,
} from '@/src/api/feedback.generated'
import {
  PRIVATE_REGISTRY_KEY,
  privateQueryOptions,
  isPrivateRegistryAccessDenied,
  clearPrivateRegistryCache,
} from '@/src/api/privateRegistry'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { usePrivateQueryRemoval } from '@/src/hooks/usePrivateQueryRemoval'

export function useFeedbackInbox(
  role: 'admin' | 'author',
  params: AuthorListVersionFeedbackParams,
  { enabled = true, allPages = false } = {}
) {
  const [user] = useFirebaseUser()
  const client = useQueryClient()
  const scope = useMemo(
    () => [PRIVATE_REGISTRY_KEY, user?.uid, role],
    [user?.uid, role]
  )
  const key = [...scope, 'inbox', params, ...(allPages ? ['all-pages'] : [])]
  const [blocked, setBlocked] = usePrivateQueryRemoval(key)
  const query = useQuery<FeedbackInbox>({
    ...privateQueryOptions,
    queryKey: key,
    enabled: enabled && !!user && !blocked,
    queryFn: async ({ signal }) => {
      const fetchPage =
        role === 'admin' ? adminListVersionFeedback : authorListVersionFeedback
      if (!allPages) return fetchPage(params, undefined, signal)
      // Version badges need the complete node-scoped summary, never message bodies
      // or one request per version. Share page traversal with admin scan history.
      const cursors = new Set<string | undefined>()
      const threads = await pageFlow(
        params.cursor,
        async (cursor: string | undefined) => {
          if (cursors.has(cursor))
            throw new Error('Repeated feedback inbox cursor')
          cursors.add(cursor)
          const page = await fetchPage({ ...params, cursor }, undefined, signal)
          return { data: page.threads, next: page.next_cursor || null }
        }
      )
        .flat()
        .toArray()
      return { threads, next_cursor: null }
    },
  })
  const denied = isPrivateRegistryAccessDenied(query.error)
  const accessDenied = blocked || denied
  useEffect(() => {
    if (!denied) return
    setBlocked(true)
    clearPrivateRegistryCache(client, scope)
  }, [denied, client, scope, setBlocked])
  const retry = async () => {
    const result = await query.refetch()
    if (result.isSuccess) setBlocked(false)
  }
  return {
    query,
    data:
      enabled && user && !accessDenied && !query.isError
        ? query.data
        : undefined,
    accessDenied,
    retry,
  }
}
