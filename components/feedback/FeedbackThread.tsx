import { Button, Spinner } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import clsx from 'clsx'
import { useNextTranslation } from '@/src/hooks/i18n'
import {
  feedbackBody,
  nextVisibleReadSeq,
  feedbackReferenceMarkdown,
} from './feedback.behavior'
import { observe } from 'react-intersection-observer'
import { FeedbackTarget, useVersionFeedback } from './useVersionFeedback'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'

export function FeedbackThread(props: FeedbackTarget) {
  const [user] = useFirebaseUser()
  return (
    <FeedbackThreadContent
      key={`${user?.uid}:${props.role}:${props.nodeId}:${props.versionId}:${props.publisherId}:${props.threadId}`}
      {...props}
    />
  )
}

function FeedbackThreadContent(target: FeedbackTarget) {
  const feedback = useVersionFeedback(target)
  const binding = feedback.data?.target
  // A version has one conversation per Publisher. Assigning its first thread ID
  // must preserve drafts; changing the recipient still discards all local state.
  return (
    <FeedbackConversation
      key={binding?.publisher_id}
      target={target}
      feedback={feedback}
    />
  )
}

function FeedbackConversation({
  target,
  feedback,
}: {
  target: FeedbackTarget
  feedback: ReturnType<typeof useVersionFeedback>
}) {
  const { t } = useNextTranslation()
  const {
    query,
    data,
    send,
    state,
    read,
    loadOlder,
    loadingOlder,
    userId,
    accessDenied,
    retry,
  } = feedback
  const { mutateAsync: markRead } = read
  const [draft, setDraft] = useState('')
  const [copyStatus, setCopyStatus] = useState<'copied' | 'failed' | null>(null)
  const [failure, setFailure] = useState<'conflict' | 'request' | null>(null)
  const pendingId = useRef<{ body: string; id: string } | null>(null)
  const sending = useRef(false)
  const seen = useRef(new Set<number>())
  const seenStarts = useRef(new Set<number>())
  const seenEnds = useRef(new Set<number>())
  const flushRead = useRef<(() => void) | null>(null)
  const messages = useRef<HTMLDivElement>(null)
  const readPending = useRef(false)
  const lastRead = useRef(0)

  useEffect(() => {
    if (accessDenied) {
      setDraft('')
      pendingId.current = null
      seen.current.clear()
      seenStarts.current.clear()
      seenEnds.current.clear()
    }
  }, [accessDenied])
  // A successful poll can retain the same data reference. Its timestamp lets us
  // retry already observed messages, even if the reader has since scrolled away.
  useEffect(() => {
    if (!data || !messages.current || query.isError || accessDenied) return
    lastRead.current = Math.max(lastRead.current, data.last_read_message_seq)
    const acknowledge = () => {
      if (document.hidden || readPending.current) return
      const seq = nextVisibleReadSeq(lastRead.current, seen.current)
      if (seq <= lastRead.current) return
      readPending.current = true
      void markRead({ target: data.target, last_read_message_seq: seq })
        .then((result) => {
          lastRead.current = Math.max(
            lastRead.current,
            result.last_read_message_seq
          )
          readPending.current = false
          flushRead.current?.()
        })
        .catch(() => {
          readPending.current = false
        })
    }
    flushRead.current = acknowledge
    acknowledge()
    // Native intersection calculation includes every clipping ancestor. Observe
    // both edges so a message taller than its scroll viewport can still be read.
    let unobserve: (() => void)[] = []
    const observeMessages = () => {
      unobserve.forEach((stop) => stop())
      unobserve = []
      if (document.hidden) return
      messages.current
        ?.querySelectorAll<HTMLElement>('[data-message-edge]')
        .forEach((edge) => {
          unobserve.push(
            observe(
              edge,
              (inView) => {
                if (!inView || document.hidden) return
                const seq = Number(edge.dataset.messageSeq)
                ;(edge.dataset.messageEdge === 'start'
                  ? seenStarts
                  : seenEnds
                ).current.add(seq)
                if (seenStarts.current.has(seq) && seenEnds.current.has(seq))
                  seen.current.add(seq)
                acknowledge()
              },
              { threshold: 1 },
              false
            )
          )
        })
    }
    observeMessages()
    document.addEventListener('visibilitychange', observeMessages)
    return () => {
      unobserve.forEach((stop) => stop())
      document.removeEventListener('visibilitychange', observeMessages)
      flushRead.current = null
    }
  }, [data, query.dataUpdatedAt, query.isError, markRead, accessDenied])

  const reportFailure = (error: unknown) => {
    const conflict =
      (error as { response?: { status?: number } })?.response?.status === 409
    setFailure(conflict ? 'conflict' : 'request')
    if (conflict) void query.refetch()
  }
  const submit = async () => {
    const body = feedbackBody(draft)
    if (!body || !data || sending.current) return
    sending.current = true
    setFailure(null)
    if (pendingId.current?.body !== body)
      pendingId.current = { body, id: crypto.randomUUID() }
    try {
      await send.mutateAsync({
        target: data.target,
        body,
        client_message_id: pendingId.current.id,
      })
      setDraft('')
      pendingId.current = null
    } catch (error) {
      reportFailure(error)
    } finally {
      sending.current = false
    }
  }
  if (!userId) return <p>{t('Sign in to view private feedback.')}</p>
  if (query.isPending && !accessDenied)
    return <Spinner aria-label={t('Loading feedback')} />
  if (accessDenied || query.isError || !data)
    return (
      <div role="alert" className="p-4 text-yellow-200">
        <p>{t('Feedback is unavailable or you no longer have access.')}</p>
        <Button color="gray" onClick={() => void retry()}>
          {t('Try again')}
        </Button>
      </div>
    )
  const resolved = data.thread?.state === 'resolved'
  const status = resolved
    ? t('Resolved')
    : data.thread?.state === 'awaiting_admin'
      ? t('Awaiting admin')
      : t('Awaiting author')
  const canWrite = data.permissions.can_start || data.permissions.can_reply
  return (
    <section
      className="ph-no-capture space-y-4 rounded-lg border border-gray-600 bg-gray-900 p-4 text-gray-200"
      data-private="true"
      aria-label={t('Private version feedback')}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{t('Private feedback')}</h3>
        {data.thread && (
          <span className="text-sm text-blue-200">
            {data.thread.archived ? t('Archived') : status}
          </span>
        )}
        {data.thread && (
          <Button
            color="gray"
            size="sm"
            title={t(
              'Paste this Markdown reference into another feedback message.'
            )}
            onClick={async () => {
              setCopyStatus(null)
              try {
                await navigator.clipboard.writeText(
                  feedbackReferenceMarkdown(
                    data.thread!,
                    window.location.origin,
                    t('{{node}}@{{version}} feedback', {
                      node: data.thread!.node_id,
                      version: data.thread!.version,
                    })
                  )
                )
                setCopyStatus('copied')
              } catch {
                setCopyStatus('failed')
              }
            }}
          >
            {copyStatus === 'copied'
              ? t('Copied!')
              : t('Copy Markdown reference')}
          </Button>
        )}
        {(data.permissions.can_resolve || data.permissions.can_reopen) && (
          <Button
            color="gray"
            size="sm"
            disabled={state.isPending}
            onClick={() => {
              setFailure(null)
              void state
                .mutateAsync({
                  target: data.target,
                  state: resolved ? 'open' : 'resolved',
                  expected_revision: data.thread!.revision,
                })
                .catch(reportFailure)
            }}
          >
            {resolved ? t('Reopen conversation') : t('Resolve conversation')}
          </Button>
        )}
      </div>
      {target.threadId && data.thread && (
        <p className="font-semibold">
          {data.thread.node_id} · v{data.thread.version}
        </p>
      )}
      {copyStatus === 'failed' && (
        <p role="alert" className="text-sm text-yellow-200">
          {t('Could not copy the reference. Please try again.')}
        </p>
      )}
      <p className="text-sm text-gray-400">
        {t(
          'Only Registry admins and this Publisher’s owners can read this conversation.'
        )}
      </p>
      {target.role === 'admin' && (
        <p className="text-sm text-gray-400">
          {t(
            'Write the changes the author should make. Resolving feedback does not approve the version.'
          )}
        </p>
      )}
      {!data.thread && (
        <p className="py-4 text-gray-300">
          {data.permissions.can_start
            ? t('Start a private conversation about this flagged version.')
            : t(
                'No feedback yet. The Registry team can start a conversation on a flagged version.'
              )}
        </p>
      )}
      {data.next_before_seq && (
        <Button
          color="gray"
          size="sm"
          disabled={loadingOlder}
          onClick={() => {
            void loadOlder().catch(reportFailure)
          }}
        >
          {t('Load earlier messages')}
        </Button>
      )}
      <div
        ref={messages}
        className="max-h-96 space-y-4 overflow-y-auto p-1"
        aria-label={t('Feedback messages')}
      >
        {data.messages.map((message) => (
          <article
            key={message.id}
            data-message-seq={message.seq}
            className={clsx(
              'relative rounded-lg border p-3',
              message.sender_user_id === userId
                ? 'ml-6 border-blue-700 bg-blue-900/30'
                : 'mr-6 border-gray-600 bg-gray-800',
              message.seq === data.thread?.last_message_seq &&
                'ring-2 ring-yellow-300'
            )}
          >
            <span
              aria-hidden="true"
              data-message-edge="start"
              data-message-seq={message.seq}
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
            />
            <div className="mb-2 flex flex-wrap gap-2 text-xs text-gray-400">
              <strong className="text-gray-200">{message.sender_name}</strong>
              {message.sender_user_id === userId && (
                <span className="font-semibold text-blue-200">{t('You')}</span>
              )}
              <span>
                {message.sender_role === 'admin' ? t('Admin') : t('Author')}
              </span>
              <time dateTime={message.created_at}>
                {new Date(message.created_at).toLocaleString()}
              </time>
              {message.seq === data.thread?.last_message_seq && (
                <span className="ml-auto rounded bg-yellow-300 px-1.5 font-semibold text-gray-900">
                  {t('Latest feedback')}
                </span>
              )}
            </div>
            <FeedbackMarkdown>{message.body}</FeedbackMarkdown>
            <span
              aria-hidden="true"
              data-message-edge="end"
              data-message-seq={message.seq}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            />
          </article>
        ))}
      </div>
      {data.events.map((event) => (
        <p key={event.id} className="text-xs text-gray-400">
          {event.event_type === 'superseded' ? (
            <>
              {t(
                'Closed by author: replaced by version {{version}}. No further follow-up on this version.',
                { version: event.replacement_version }
              )}
              {target.role === 'admin' && event.replacement_version && (
                <>
                  {' '}
                  ·{' '}
                  <a
                    className="text-blue-300 underline"
                    href={`/admin/nodeversions?nodeId=${encodeURIComponent(target.nodeId)}&version=${encodeURIComponent(event.replacement_version)}`}
                  >
                    {t('Review replacement version')}
                  </a>
                </>
              )}
            </>
          ) : event.event_type === 'resolved' ? (
            t('Conversation resolved')
          ) : event.event_type === 'reopened' ? (
            t('Conversation reopened')
          ) : (
            t('Conversation archived')
          )}{' '}
          ·{' '}
          <time dateTime={event.created_at}>
            {new Date(event.created_at).toLocaleString()}
          </time>
        </p>
      ))}
      {failure && (
        <p role="alert" className="text-sm text-yellow-200">
          {failure === 'conflict'
            ? t(
                'The conversation changed. Review the latest conversation before trying again. Your draft is preserved.'
              )
            : t(
                'The request failed. Your draft is preserved; please try again.'
              )}
        </p>
      )}
      {canWrite ? (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void submit()
          }}
          className="space-y-3"
        >
          <label
            htmlFor={`feedback-${target.versionId}`}
            className="block text-sm"
          >
            {target.role === 'admin'
              ? t('Private feedback to the author')
              : t('Private reply to the Registry team')}
          </label>
          <textarea
            id={`feedback-${target.versionId}`}
            className="w-full rounded border border-gray-600 bg-gray-800 text-white"
            rows={4}
            maxLength={10000}
            value={draft}
            disabled={send.isPending}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault()
                void submit()
              }
            }}
          />
          {draft.trim() && (
            <section
              aria-label={t('Message preview')}
              className="space-y-2 rounded border border-gray-600 bg-gray-800 p-3"
            >
              <h4 className="text-xs font-semibold text-gray-400">
                {t('Preview')}
              </h4>
              <FeedbackMarkdown>{draft}</FeedbackMarkdown>
            </section>
          )}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-400">
              {t('Markdown supported')} · {Array.from(draft).length} / 5,000
            </span>
            <Button
              type="submit"
              disabled={!feedbackBody(draft) || send.isPending}
            >
              {send.isPending
                ? t('Sending…')
                : target.role === 'admin'
                  ? t('Send feedback')
                  : t('Send reply')}
            </Button>
          </div>
        </form>
      ) : (
        data.thread && (
          <p className="text-sm text-gray-400">
            {t('This conversation is read-only.')}
          </p>
        )
      )}
    </section>
  )
}

// History and the live composer preview share the same formatting and security policy.
function FeedbackMarkdown({ children }: { children: string }) {
  return (
    <div className="space-y-2 break-words text-sm text-gray-200 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-500 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-gray-900 [&_code]:px-1 [&_h1]:text-xl [&_h2]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:whitespace-pre-wrap [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-gray-900 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5">
      <Markdown
        components={{
          a: ({ href, children }) =>
            href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 underline"
              >
                {children}
              </a>
            ) : (
              <>{children}</>
            ),
          // Private messages must not load remote tracking images.
          img: ({ alt }) => <>{alt}</>,
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}
