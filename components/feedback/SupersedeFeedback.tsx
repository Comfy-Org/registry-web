import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Modal } from 'flowbite-react'
import { useRef, useState } from 'react'
import {
  type ListNodeVersionsParams,
  type NodeVersion,
} from '@/src/api/generated'
import {
  authorSupersedeVersionFeedback,
  type FeedbackSummary,
  type FeedbackSupersedeInput,
} from '@/src/api/feedback.generated'
import {
  clearPrivateRegistryCache,
  isPrivateRegistryAccessDenied,
  PRIVATE_REGISTRY_KEY,
  privateMutationOptions,
} from '@/src/api/privateRegistry'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  INVALIDATE_CACHE_OPTION,
  shouldInvalidate,
} from '@/components/cache-control'

type Props = {
  nodeId: string
  publisherId: string
  versions: NodeVersion[]
  versionParams: ListNodeVersionsParams
  summaries: FeedbackSummary[]
}
type Selection = {
  replacement: NodeVersion
  numbers: string[]
  input: FeedbackSupersedeInput
}

export function SupersedeFeedback(props: Props) {
  const [user] = useFirebaseUser()
  return user ? (
    <SupersedeFeedbackContent
      key={`${user.uid}:${props.nodeId}:${props.publisherId}`}
      {...props}
      userId={user.uid}
    />
  ) : null
}

function SupersedeFeedbackContent({
  nodeId,
  publisherId,
  versions,
  versionParams,
  summaries,
  userId,
}: Props & { userId: string }) {
  const { t } = useNextTranslation()
  const client = useQueryClient()
  const [selection, setSelection] = useState<Selection | null>(null)
  const [failure, setFailure] = useState<'conflict' | 'request' | null>(null)
  const submitting = useRef(false)
  const mutation = useMutation({
    ...privateMutationOptions,
    mutationKey: [PRIVATE_REGISTRY_KEY, userId, 'author', nodeId, 'supersede'],
    mutationFn: (selected: Selection) =>
      authorSupersedeVersionFeedback(
        publisherId,
        nodeId,
        selected.replacement.id!,
        selected.input
      ),
  })
  const replacement = versions.reduce<NodeVersion | undefined>(
    (latest, version) =>
      !latest ||
      Date.parse(version.createdAt ?? '') > Date.parse(latest.createdAt ?? '')
        ? version
        : latest,
    undefined
  )
  const eligible =
    replacement?.id && !replacement.deprecated
      ? versions
          .flatMap((version) => {
            const summary = summaries.find(
              ({ thread }) => thread.version_id === version.id
            )
            if (
              !summary ||
              summary.thread.archived ||
              !summary.thread.last_message_seq ||
              (version.deprecated && summary.thread.state === 'resolved') ||
              !(
                Date.parse(version.createdAt ?? '') <
                Date.parse(replacement.createdAt ?? '')
              )
            )
              return []
            return [{ version, thread: summary.thread }]
          })
          .slice(0, 100)
      : []
  const refresh = async () => {
    const options = shouldInvalidate.getListNodeVersionsQueryOptions(
      nodeId,
      versionParams,
      INVALIDATE_CACHE_OPTION
    )
    // Replace any pre-mutation request and refresh the exact HTTP-cached URL
    // displayed by the page, including its status filters.
    await client.cancelQueries({ queryKey: options.queryKey, exact: true })
    await client.fetchQuery(options)
    await Promise.all([
      client.invalidateQueries(
        {
          queryKey: [PRIVATE_REGISTRY_KEY, userId],
          predicate: ({ queryKey }) =>
            queryKey[3] === 'inbox' ||
            queryKey[3] === nodeId ||
            queryKey[3] === 'admin-versions',
        },
        { throwOnError: true }
      ),
      client.invalidateQueries(
        {
          predicate: ({ queryKey }) =>
            typeof queryKey[0] === 'string' &&
            queryKey[0].startsWith(`/nodes/${nodeId}/versions/`),
        },
        { throwOnError: true }
      ),
    ])
  }
  const confirm = async () => {
    if (!selection || submitting.current) return
    submitting.current = true
    setFailure(null)
    try {
      await mutation.mutateAsync(selection)
      await refresh()
      setSelection(null)
    } catch (error) {
      if (isPrivateRegistryAccessDenied(error)) {
        setSelection(null)
        clearPrivateRegistryCache(client, [
          PRIVATE_REGISTRY_KEY,
          userId,
          'author',
        ])
      } else if (
        (error as { response?: { status?: number } })?.response?.status === 409
      ) {
        try {
          await refresh()
          setSelection(null)
          setFailure('conflict')
        } catch {
          setFailure('request')
        }
      } else {
        setFailure('request')
      }
    } finally {
      submitting.current = false
    }
  }
  if (!eligible.length && !selection) return null
  return (
    <div className="dark ph-no-capture my-4 space-y-3" data-private="true">
      <Button
        color="gray"
        disabled={!eligible.length || !!selection}
        onClick={() => {
          setFailure(null)
          // Freeze what the owner reviewed. Polls must not silently change this request.
          setSelection({
            replacement: replacement!,
            numbers: eligible.map(({ version }) => version.version!),
            input: {
              versions: eligible.map(({ version, thread }) => ({
                version_id: version.id!,
                target: { publisher_id: publisherId, thread_id: thread.id },
                expected_revision: thread.revision,
              })),
            },
          })
        }}
      >
        {t('Deprecate and close earlier feedback')}
      </Button>
      {failure === 'conflict' && (
        <p role="alert" className="text-yellow-200">
          {t(
            'Feedback changed. Review the refreshed selection before trying again.'
          )}
        </p>
      )}
      <Modal
        className="dark bg-opacity-80"
        show={!!selection}
        onClose={() => {
          if (!submitting.current) setSelection(null)
        }}
        size="lg"
      >
        <Modal.Header>{t('Replace earlier feedback versions')}</Modal.Header>
        <Modal.Body
          className="ph-no-capture space-y-4 text-gray-900 dark:text-gray-200"
          data-private="true"
        >
          <p>
            {t('Replacement: {{version}}', {
              version: selection?.replacement.version,
            })}
          </p>
          <p>
            {t(
              'These versions will be deprecated and their feedback closed. You will no longer follow feedback on these versions. The Registry team should review the replacement separately.'
            )}
          </p>
          <p>
            {t(
              'This does not confirm that issues are fixed or approve the replacement version.'
            )}
          </p>
          <p>
            {t('Selected versions ({{count}}, up to 100 at a time)', {
              count: selection?.numbers.length,
            })}
          </p>
          <ul className="list-disc pl-5">
            {selection?.numbers.map((number) => (
              <li key={number}>{number}</li>
            ))}
          </ul>
          {failure === 'request' && (
            <p role="alert" className="text-yellow-200">
              {t('The request failed. Try again to finish the same selection.')}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="blue"
            disabled={mutation.isPending || submitting.current}
            onClick={() => void confirm()}
          >
            {t('Deprecate and close')}
          </Button>
          <Button
            color="gray"
            disabled={mutation.isPending || submitting.current}
            onClick={() => setSelection(null)}
          >
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
