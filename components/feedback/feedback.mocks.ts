import { http, HttpResponse } from 'msw'
import type {
  FeedbackMessageInput,
  FeedbackStateInput,
  FeedbackReadInput,
} from '@/src/api/feedback.generated'
import { feedbackFixture } from './feedback.fixtures'

export type FeedbackRequests = {
  messages: FeedbackMessageInput[]
  states: FeedbackStateInput[]
}

export function feedbackHandlers(
  admin = false,
  mode = 'open',
  requests?: FeedbackRequests,
  fixture = feedbackFixture(admin)
) {
  let data = structuredClone(fixture)
  let failNextMessage = mode === 'failure'
  if (mode === 'empty') {
    data.thread = null
    data.target.thread_id = null
    data.messages = []
    data.permissions = {
      can_start: admin,
      can_reply: false,
      can_resolve: false,
      can_reopen: false,
    }
  }
  if (mode === 'resolved') {
    data.thread!.state = 'resolved'
    data.permissions.can_reply = false
    data.permissions.can_resolve = false
    data.permissions.can_reopen = admin
  }
  if (mode === 'revoked-on-history') {
    data.messages[0].seq = 2
    data.thread!.last_message_seq = 2
    data.next_before_seq = 2
  }
  return [
    http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () =>
      HttpResponse.json(data)
    ),
    http.get(
      '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback',
      ({ request }) =>
        mode === 'forbidden' ||
        (mode === 'revoked-on-history' &&
          new URL(request.url).searchParams.has('before_seq'))
          ? HttpResponse.json(
              { message: 'Resource not found' },
              { status: 404 }
            )
          : HttpResponse.json(data)
    ),
    http.post(/\/feedback\/read$/, async ({ request }) => {
      const input = (await request.json()) as FeedbackReadInput
      if (
        input.target.publisher_id !== data.target.publisher_id ||
        input.target.thread_id !== data.target.thread_id
      )
        return HttpResponse.json(
          { message: 'Conversation changed' },
          { status: 409 }
        )
      data.last_read_message_seq = Math.max(
        data.last_read_message_seq,
        input.last_read_message_seq
      )
      return HttpResponse.json({
        last_read_message_seq: data.last_read_message_seq,
      })
    }),
    http.post(/\/feedback\/messages$/, async ({ request }) => {
      const body = (await request.json()) as FeedbackMessageInput
      requests?.messages.push(body)
      if (mode === 'revoked-on-send')
        return HttpResponse.json(
          { message: 'Resource not found' },
          { status: 404 }
        )
      if (failNextMessage) {
        failNextMessage = false
        return HttpResponse.json({ message: 'Unavailable' }, { status: 500 })
      }
      if (
        body.target.publisher_id !== data.target.publisher_id ||
        body.target.thread_id !== data.target.thread_id
      )
        return HttpResponse.json(
          { message: 'Conversation changed' },
          { status: 409 }
        )
      if (!data.thread) {
        data.thread = structuredClone(fixture.thread)
        data.target = structuredClone(fixture.target)
        data.thread!.last_message_seq = 0
        data.permissions.can_start = false
        data.permissions.can_reply = true
        data.permissions.can_resolve = admin
      }
      data = {
        ...data,
        thread: {
          ...data.thread!,
          last_message_seq: data.thread!.last_message_seq + 1,
          revision: data.thread!.revision + 1,
          state: admin ? 'awaiting_author' : 'awaiting_admin',
        },
        messages: [
          ...data.messages,
          {
            id: crypto.randomUUID(),
            seq: data.thread!.last_message_seq + 1,
            sender_user_id: 'firebase-user-123',
            sender_name: admin ? 'Registry team' : 'Publisher owner',
            sender_role: admin ? 'admin' : 'author',
            body: body.body,
            created_at: new Date().toISOString(),
          },
        ],
      }
      return HttpResponse.json(data)
    }),
    http.patch(/\/feedback$/, async ({ request }) => {
      const body = (await request.json()) as FeedbackStateInput
      requests?.states.push(body)
      if (
        body.target.publisher_id !== data.target.publisher_id ||
        body.target.thread_id !== data.target.thread_id
      )
        return HttpResponse.json(
          { message: 'Conversation changed' },
          { status: 409 }
        )
      const resolved = body.state === 'resolved'
      data = {
        ...data,
        thread: {
          ...data.thread!,
          state: resolved ? 'resolved' : 'awaiting_author',
          revision: data.thread!.revision + 1,
        },
        permissions: {
          ...data.permissions,
          can_reply: !resolved,
          can_resolve: !resolved,
          can_reopen: resolved,
        },
      }
      return HttpResponse.json(data)
    }),
  ]
}
