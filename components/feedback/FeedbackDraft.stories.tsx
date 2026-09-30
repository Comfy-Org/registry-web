import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { FeedbackThread } from './FeedbackThread'
import { feedbackFixture, versionId } from './feedback.fixtures'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'
import type {
  FeedbackResponse,
  FeedbackMessageInput,
  FeedbackStateInput,
} from '@/src/api/feedback.generated'

let client: QueryClient
let data: FeedbackResponse
let requests: FeedbackMessageInput[] = []
let stateRequests: FeedbackStateInput[] = []
let holdSend = false
let finishSend: (() => void) | undefined
function AdminConversation() {
  client = useQueryClient()
  return <FeedbackThread role="admin" nodeId="example" versionId={versionId} />
}
const meta: Meta<typeof AdminConversation> = {
  title: 'Feedback/Draft recovery',
  component: AdminConversation,
  beforeEach: () => {
    requests = []
    stateRequests = []
    holdSend = false
    finishSend = undefined
    data = feedbackFixture(true)
    data.thread = null
    data.target.thread_id = null
    data.messages = []
    data.permissions = {
      can_start: true,
      can_reply: false,
      can_resolve: false,
      can_reopen: false,
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () =>
          HttpResponse.json(data)
        ),
        http.post(/\/feedback\/read$/, async ({ request }) =>
          HttpResponse.json(await request.json())
        ),
        http.post(/\/feedback\/messages$/, async ({ request }) => {
          const input = (await request.json()) as FeedbackMessageInput
          requests.push(input)
          if (
            input.target.publisher_id !== data.target.publisher_id ||
            input.target.thread_id !== data.target.thread_id
          )
            return HttpResponse.json(
              { message: 'Conversation changed' },
              { status: 409 }
            )
          if (!data.thread) {
            data = feedbackFixture(true)
            data.messages = []
            data.thread!.last_message_seq = 0
          }
          const seq = data.thread!.last_message_seq + 1
          data.messages = [
            ...data.messages,
            {
              ...feedbackFixture().messages[0],
              id: crypto.randomUUID(),
              seq,
              body: input.body,
            },
          ]
          data.thread!.last_message_seq = seq
          data.thread!.revision += 1
          data.last_read_message_seq = seq
          data.unread_count = 0
          if (holdSend)
            await new Promise<void>((resolve) => {
              finishSend = resolve
            })
          return HttpResponse.json(data)
        }),
        http.patch(/\/feedback$/, async ({ request }) => {
          const input = (await request.json()) as FeedbackStateInput
          stateRequests.push(input)
          if (input.expected_revision !== data.thread?.revision)
            return HttpResponse.json(
              { message: 'Conversation changed' },
              { status: 409 }
            )
          data.thread.state = 'resolved'
          data.thread.revision += 1
          data.permissions.can_reply = false
          data.permissions.can_resolve = false
          data.permissions.can_reopen = true
          return HttpResponse.json(data)
        }),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const KeepsUnsentDraftWhenAnotherAdminStartsTheThread: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByRole('textbox'),
      'Please remove the unverified install script.'
    )
    data = feedbackFixture(true)
    data.last_read_message_seq = 1
    data.messages[0].body = 'Another admin started this conversation.'
    await client.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await canvas.findByText('Another admin started this conversation.')
    expect(canvas.getByRole('textbox')).toHaveValue(
      'Please remove the unverified install script.'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await within(canvas.getByLabelText('Feedback messages')).findByText(
      'Please remove the unverified install script.'
    )
    expect(requests).toHaveLength(1)
    expect(requests[0].target).toEqual(feedbackFixture(true).target)
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(''))
  },
}

export const KeepsDraftAcrossResolveAndReopen: Story = {
  beforeEach: () => {
    data = feedbackFixture(true)
    data.last_read_message_seq = 1
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByRole('textbox'),
      'Keep this draft until the review resumes.'
    )
    data.thread!.state = 'resolved'
    data.permissions = {
      can_start: false,
      can_reply: false,
      can_resolve: false,
      can_reopen: true,
    }
    await client.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await canvas.findByText('This conversation is read-only.')
    expect(canvas.queryByRole('textbox')).toBeNull()
    data = feedbackFixture(true)
    data.last_read_message_seq = 1
    await client.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await waitFor(() =>
      expect(canvas.getByRole('textbox')).toHaveValue(
        'Keep this draft until the review resumes.'
      )
    )
  },
}

export const PendingFirstSendSurvivesThreadDiscovery: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    holdSend = true
    await userEvent.type(
      await canvas.findByRole('textbox'),
      'First feedback with a delayed response.'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await waitFor(() => expect(typeof finishSend).toBe('function'))
    await client.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await within(canvas.getByLabelText('Feedback messages')).findByText(
      'First feedback with a delayed response.'
    )
    expect(canvas.getByRole('textbox')).toHaveValue(
      'First feedback with a delayed response.'
    )
    expect(canvas.getByRole('textbox')).toBeDisabled()
    finishSend!()
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(''))
    expect(requests).toHaveLength(1)
    expect(requests[0].target).toEqual({
      publisher_id: 'example-publisher',
      thread_id: null,
    })
  },
}

export const ConflictRefreshesWithoutResendingDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const draft = 'Keep my reply until I review the new conversation.'
    await userEvent.type(await canvas.findByRole('textbox'), draft)
    // Another admin creates the thread after our last read, before this send.
    data = feedbackFixture(true)
    data.last_read_message_seq = 1
    data.messages[0].body = 'Another admin started this conversation.'
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await canvas.findByText('Another admin started this conversation.')
    expect(canvas.getByRole('textbox')).toHaveValue(draft)
    expect(requests).toHaveLength(1)
    expect(requests[0].target.thread_id).toBeNull()
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await within(canvas.getByLabelText('Feedback messages')).findByText(draft)
    expect(requests).toHaveLength(2)
    expect(requests[1]).toEqual({
      ...requests[0],
      target: feedbackFixture(true).target,
    })
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(''))
  },
}

export const ConflictRefreshesStateRevision: Story = {
  beforeEach: () => {
    data = feedbackFixture(true)
    data.last_read_message_seq = 1
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByRole('textbox'),
      'Keep this unsent reply.'
    )
    data.thread!.revision = 2
    data.messages[0].body = 'Updated review details.'
    await userEvent.click(
      canvas.getByRole('button', { name: 'Resolve conversation' })
    )
    await canvas.findByText('Updated review details.')
    expect(canvas.getByRole('textbox')).toHaveValue('Keep this unsent reply.')
    expect(stateRequests.map((input) => input.expected_revision)).toEqual([1])
    await userEvent.click(
      canvas.getByRole('button', { name: 'Resolve conversation' })
    )
    await canvas.findByText('This conversation is read-only.')
    expect(stateRequests.map((input) => input.expected_revision)).toEqual([
      1, 2,
    ])
    expect(requests).toHaveLength(0)
  },
}
