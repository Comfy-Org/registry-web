import type {
  FeedbackResponse,
  FeedbackThread,
  FeedbackWriteTarget,
} from '@/src/api/feedback.generated'

export function feedbackBody(value: string): string | null {
  const body = value.trim()
  return body && Array.from(body).length <= 5000 ? body : null
}

export function nextVisibleReadSeq(
  previous: number,
  visible: ReadonlySet<number>
): number {
  let next = previous
  while (visible.has(next + 1)) next += 1
  return next
}

// Keep all pages already displayed. Derive the next cursor from actual gaps so
// even a poll that advances by more than one page leaves missing messages reachable.
export function mergeFeedbackPages(
  previous: FeedbackResponse | undefined,
  incoming: FeedbackResponse
): FeedbackResponse {
  if (!previous || !sameFeedbackTarget(previous.target, incoming.target))
    return incoming
  const messages = [
    ...new Map(
      [...previous.messages, ...incoming.messages].map((message) => [
        message.seq,
        message,
      ])
    ).values(),
  ].sort((a, b) => a.seq - b.seq)
  let before = messages[0]?.seq > 1 ? messages[0].seq : null
  for (let i = 1; i < messages.length; i++) {
    if (messages[i].seq > messages[i - 1].seq + 1) before = messages[i].seq
  }
  return { ...incoming, messages, next_before_seq: before }
}

export function sameFeedbackTarget(
  a: FeedbackWriteTarget,
  b: FeedbackWriteTarget
): boolean {
  return a.publisher_id === b.publisher_id && a.thread_id === b.thread_id
}

// Standard Markdown stays portable across composers and uses the existing safe renderer.
export function feedbackReferenceMarkdown(
  thread: FeedbackThread,
  origin: string,
  label: string
): string {
  const query = new URLSearchParams({
    nodeId: thread.node_id,
    versionId: thread.version_id,
    publisherId: thread.publisher_id,
  })
  const url = new URL(
    `/feedback/${encodeURIComponent(thread.id)}?${query}`,
    origin
  )
  const escapedLabel = label.replace(/[\\[\]`*_<>]/g, '\\$&')
  return `[${escapedLabel}](${url.href})`
}
