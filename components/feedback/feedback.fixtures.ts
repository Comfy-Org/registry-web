import type { FeedbackResponse } from '@/src/api/feedback.generated'
export const versionId = '44444444-4444-4444-8444-444444444444'
export function feedbackFixture(admin = false): FeedbackResponse {
  return {
    target: {
      publisher_id: 'example-publisher',
      thread_id: '11111111-1111-4111-8111-111111111111',
    },
    thread: {
      id: '11111111-1111-4111-8111-111111111111',
      node_id: 'example',
      version_id: versionId,
      version: '1.0.0',
      publisher_id: 'example-publisher',
      state: 'awaiting_author',
      revision: 1,
      last_message_seq: 1,
      last_message_at: '2026-09-30T09:00:00Z',
      archived: false,
    },
    messages: [
      {
        id: '22222222-2222-4222-8222-222222222222',
        seq: 1,
        sender_user_id: 'admin',
        sender_name: 'Registry team',
        sender_role: 'admin',
        body: 'Please revise the installation command and share the replacement nodepack version.',
        created_at: '2026-09-30T09:00:00Z',
      },
    ],
    events: [],
    last_read_message_seq: 0,
    unread_count: 1,
    next_before_seq: null,
    permissions: {
      can_start: false,
      can_reply: true,
      can_resolve: admin,
      can_reopen: false,
    },
  }
}
