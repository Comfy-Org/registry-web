import { Button, Modal, Spinner } from 'flowbite-react'
import { useEffect, useState } from 'react'
import {
  FeedbackState,
  FeedbackThread as Thread,
} from '@/src/api/feedback.generated'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { useNextTranslation } from '@/src/hooks/i18n'
import { FeedbackThread } from './FeedbackThread'
import { useFeedbackInbox } from './useFeedbackInbox'
import { UnresolvedFeedbackBadge } from './UnresolvedFeedbackBadge'

export function FeedbackInbox({
  role,
  nodeId,
}: {
  role: 'admin' | 'author'
  nodeId?: string
}) {
  const [user] = useFirebaseUser()
  // Identity changes discard local cursors and selections as well as query data.
  return (
    <FeedbackInboxContent
      key={`${user?.uid}:${role}:${nodeId}`}
      role={role}
      nodeId={nodeId}
    />
  )
}
function FeedbackInboxContent({
  role,
  nodeId,
}: {
  role: 'admin' | 'author'
  nodeId?: string
}) {
  const { t } = useNextTranslation()
  const [user] = useFirebaseUser()
  const [selected, setSelected] = useState<Thread | null>(null)
  const [cursor, setCursor] = useState<string | undefined>()
  const [state, setState] = useState<FeedbackState | undefined>()
  const { query, data, accessDenied, retry } = useFeedbackInbox(role, {
    nodeId,
    cursor,
    state,
  })
  useEffect(() => {
    if (!accessDenied) return
    setSelected(null)
    setCursor(undefined)
  }, [accessDenied])
  if (!user) return null
  return (
    <section
      className="ph-no-capture my-6 space-y-3 rounded-lg border border-gray-700 p-4"
      data-private="true"
      aria-label={t('Feedback inbox')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('Private feedback')}</h2>
        <label className="text-sm">
          {t('Conversation status')}{' '}
          <select
            className="rounded bg-gray-800"
            value={state ?? ''}
            disabled={accessDenied}
            onChange={(event) => {
              setState((event.target.value as FeedbackState) || undefined)
              setCursor(undefined)
            }}
          >
            <option value="">{t('All conversations')}</option>
            <option value="awaiting_author">{t('Awaiting author')}</option>
            <option value="awaiting_admin">{t('Awaiting admin')}</option>
            <option value="resolved">{t('Resolved')}</option>
          </select>
        </label>
      </div>
      {accessDenied || query.isError ? (
        <div role="alert" className="space-y-2">
          <p>{t('Could not load private feedback. Please try again.')}</p>
          <Button
            size="sm"
            color="gray"
            onClick={() => void retry()}
            disabled={query.isFetching}
          >
            {t('Try again')}
          </Button>
        </div>
      ) : query.isPending ? (
        <Spinner aria-label={t('Loading feedback')} />
      ) : data?.threads.length ? (
        <ul className="divide-y divide-gray-700">
          {data.threads.map(({ thread, unread_count }) => (
            <li key={thread.id}>
              <button
                className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left"
                onClick={() => setSelected(thread)}
              >
                <span className="flex flex-wrap items-center gap-2">
                  {thread.node_id} · v{thread.version}
                  {role === 'author' && (
                    <UnresolvedFeedbackBadge thread={thread} />
                  )}
                </span>
                <span className="text-sm text-blue-200">
                  {unread_count > 0
                    ? t('{{count}} unread', { count: unread_count })
                    : thread.archived
                      ? t('Archived')
                      : thread.state === 'resolved'
                        ? t('Resolved')
                        : thread.state === 'awaiting_admin'
                          ? t('Awaiting admin')
                          : t('Awaiting author')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">
          {t('No feedback conversations found.')}
        </p>
      )}
      <div className="flex gap-3">
        {!accessDenied && cursor && (
          <Button size="sm" color="gray" onClick={() => setCursor(undefined)}>
            {t('Back to latest')}
          </Button>
        )}
        {data?.next_cursor && (
          <Button
            size="sm"
            color="gray"
            onClick={() => setCursor(data.next_cursor!)}
          >
            {t('Older conversations')}
          </Button>
        )}
      </div>
      <Modal
        show={!!selected && !accessDenied}
        onClose={() => setSelected(null)}
        size="4xl"
      >
        <Modal.Header>
          {selected?.node_id} · v{selected?.version}
        </Modal.Header>
        <Modal.Body>
          {selected && !accessDenied && (
            <FeedbackThread
              nodeId={selected.node_id}
              versionId={selected.version_id}
              publisherId={selected.publisher_id}
              role={role}
            />
          )}
        </Modal.Body>
      </Modal>
    </section>
  )
}
