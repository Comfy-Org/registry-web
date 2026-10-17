import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { http, HttpResponse } from 'msw'
import { expect, mocked, userEvent, waitFor, within } from 'storybook/test'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { getRouter } from '@storybook/nextjs-vite/router.mock'
import FeedbackReferencePage from '@/pages/feedback/[threadId]'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser'
import { feedbackFixture, versionId } from './feedback.fixtures'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'

let admin = false
let failure = false
let transferred = false
let identityStatus = 200
let open = false
let client: QueryClient
let requests: string[] = []
const query = {
  threadId: feedbackFixture().thread!.id,
  nodeId: 'example',
  versionId,
  publisherId: 'example-publisher',
}
const path = `/feedback/${query.threadId}?nodeId=example&versionId=${versionId}&publisherId=example-publisher`
function ReferencePage() {
  client = useQueryClient()
  return <FeedbackReferencePage />
}
const meta: Meta<typeof ReferencePage> = {
  title: 'Feedback/Reference page',
  component: ReferencePage,
  beforeEach: () => {
    admin = false
    failure = false
    transferred = false
    identityStatus = 200
    open = false
    requests = []
  },
  parameters: {
    nextjs: {
      router: {
        isReady: true,
        pathname: '/feedback/[threadId]',
        asPath: path,
        query,
      },
    },
    msw: {
      handlers: [
        http.get('*/users', ({ request }) => {
          requests.push(request.url)
          if (identityStatus !== 200)
            return HttpResponse.json(
              { message: 'Unavailable' },
              { status: identityStatus }
            )
          return HttpResponse.json({ id: 'firebase-user-123', isAdmin: admin })
        }),
        http.get(/\/feedback$/, ({ request }) => {
          requests.push(request.url)
          if (failure)
            return HttpResponse.json(
              { message: 'Resource not found' },
              { status: 404 }
            )
          const data = feedbackFixture(admin)
          data.thread!.state = 'resolved'
          data.thread!.archived = true
          data.permissions = {
            can_start: false,
            can_reply: false,
            can_resolve: false,
            can_reopen: false,
          }
          data.last_read_message_seq = 1
          data.unread_count = 0
          if (open) {
            data.thread!.state = 'awaiting_admin'
            data.thread!.archived = false
            data.permissions.can_reply = true
          }
          if (transferred) {
            data.target = {
              publisher_id: 'new-publisher',
              thread_id: '99999999-9999-4999-8999-999999999999',
            }
            data.thread = {
              ...data.thread!,
              id: data.target.thread_id!,
              publisher_id: 'new-publisher',
            }
            data.messages[0].body = "A different Publisher's conversation."
          }
          return HttpResponse.json(data)
        }),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>
export const OwnerReadsArchivedReference: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(feedbackFixture().messages[0].body)
    expect(canvas.getByText('example · v1.0.0')).toBeInTheDocument()
    expect(canvas.getByText('Archived')).toBeInTheDocument()
    expect(canvas.queryByRole('textbox')).toBeNull()
    expect(requests.filter((url) => url.endsWith('/feedback'))).toEqual([
      expect.stringContaining(
        `/publishers/example-publisher/nodes/example/versions/${versionId}/feedback`
      ),
    ])
  },
}
export const AdminReadsSameReference: Story = {
  beforeEach: () => {
    admin = true
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(feedbackFixture().messages[0].body)
    expect(requests.filter((url) => url.endsWith('/feedback'))).toEqual([
      expect.stringContaining(
        `/admin/nodes/example/versions/${versionId}/feedback`
      ),
    ])
  },
}
export const InaccessibleReference: Story = {
  beforeEach: () => {
    failure = true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(
      'Feedback is unavailable or you no longer have access.'
    )
    expect(canvas.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    expect(
      canvas.queryByRole('button', { name: 'Copy Markdown reference' })
    ).toBeNull()
  },
}
export const WrongThreadDoesNotOpenAnotherConversation: Story = {
  parameters: {
    nextjs: {
      router: {
        query: { ...query, threadId: '77777777-7777-4777-8777-777777777777' },
      },
    },
  },
  play: InaccessibleReference.play,
}
export const WrongPublisherDoesNotOpenMatchingThread: Story = {
  beforeEach: () => {
    admin = true
  },
  parameters: {
    nextjs: {
      router: { query: { ...query, publisherId: 'different-publisher' } },
    },
  },
  // The admin API returns the same thread ID; only the reference's Publisher is wrong.
  play: InaccessibleReference.play,
}
export const TransferDoesNotRetargetAnOldReference: Story = {
  beforeEach: () => {
    admin = true
    transferred = true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(
      'Feedback is unavailable or you no longer have access.'
    )
    expect(
      canvas.queryByText("A different Publisher's conversation.")
    ).toBeNull()
    expect(canvas.queryByRole('textbox')).toBeNull()
  },
}
export const InvalidReferenceMakesNoPrivateRequest: Story = {
  parameters: {
    nextjs: { router: { query: { ...query, threadId: 'invalid' } } },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(
      'This feedback reference is invalid.'
    )
    expect(requests).toEqual([])
  },
}
export const SignedOutReferenceKeepsLoginDestination: Story = {
  beforeEach: () => {
    mocked(useFirebaseUser).mockReturnValue([null, false, undefined])
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(getRouter().push).toHaveBeenCalledWith(
        `/auth/login?fromUrl=${encodeURIComponent(path)}`
      )
    )
    expect(
      within(canvasElement).queryByText(feedbackFixture().messages[0].body)
    ).toBeNull()
    expect(requests).toEqual([])
  },
}

export const IdentityRefreshPreservesDraftUntilAccessIsDenied: Story = {
  beforeEach: () => {
    open = true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const draft = 'The same installation issue persists in 1.0.1.'
    await userEvent.type(await canvas.findByRole('textbox'), draft)
    const identity = {
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'reference-user'],
    }
    identityStatus = 500
    await client.refetchQueries(identity)
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(draft))
    identityStatus = 200
    await client.refetchQueries(identity)
    await waitFor(() => expect(canvas.getByRole('textbox')).toHaveValue(draft))
    identityStatus = 401
    await client.refetchQueries(identity)
    await canvas.findByText(
      'Feedback is unavailable or you no longer have access.'
    )
    expect(canvas.queryByRole('textbox')).toBeNull()
    expect(canvas.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    identityStatus = 200
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
    expect(await canvas.findByRole('textbox')).toHaveValue('')
  },
}
