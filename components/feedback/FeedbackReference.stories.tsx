import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { feedbackFixture, versionId } from './feedback.fixtures'
import { feedbackHandlers, type FeedbackRequests } from './feedback.mocks'
import { FeedbackThread } from './FeedbackThread'

let copied = ''
let clipboardFailure = false
let clipboard: PropertyDescriptor | undefined
const meta: Meta<typeof FeedbackThread> = {
  title: 'Feedback/References',
  component: FeedbackThread,
  args: {
    role: 'admin',
    nodeId: 'example',
    versionId,
    publisherId: 'example-publisher',
  },
  beforeEach: () => {
    copied = ''
    clipboardFailure = false
    clipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          if (clipboardFailure) throw new Error('Clipboard unavailable')
          copied = value
        },
      },
    })
    return () => {
      if (clipboard) Object.defineProperty(navigator, 'clipboard', clipboard)
      else Reflect.deleteProperty(navigator, 'clipboard')
    }
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () => {
          const data = feedbackFixture(true)
          data.thread!.state = 'resolved'
          data.thread!.archived = true
          data.permissions = {
            can_start: false,
            can_reply: false,
            can_resolve: false,
            can_reopen: false,
          }
          data.last_read_message_seq = 1
          return HttpResponse.json(data)
        }),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>
export const CopyArchivedThreadReference: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Copy Markdown reference' })
    )
    await waitFor(() =>
      expect(copied).toMatch(/^\[example@1\.0\.0 feedback\]\(http/)
    )
    const href = copied.match(/\]\((.*)\)$/)![1]
    const url = new URL(href)
    expect(url.origin).toBe(window.location.origin)
    expect(url.pathname).toBe(`/feedback/${feedbackFixture().thread!.id}`)
    expect(Object.fromEntries(url.searchParams)).toEqual({
      nodeId: 'example',
      versionId,
      publisherId: 'example-publisher',
    })
    expect(url.pathname).not.toContain('/admin/')
    expect(canvas.queryByRole('textbox')).toBeNull()
    expect(canvas.getByRole('button', { name: 'Copied!' })).toBeInTheDocument()
  },
}
export const ClipboardFailureIsVisible: Story = {
  beforeEach: () => {
    clipboardFailure = true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Copy Markdown reference' })
    )
    await canvas.findByText('Could not copy the reference. Please try again.')
    expect(copied).toBe('')
    expect(canvas.queryByRole('button', { name: 'Copied!' })).toBeNull()
  },
}

const sent: FeedbackRequests = { messages: [], states: [] }
const replacementId = '77777777-7777-4777-8777-777777777777'
const replacement = feedbackFixture(true)
replacement.thread = {
  ...replacement.thread!,
  id: '88888888-8888-4888-8888-888888888888',
  version_id: replacementId,
  version: '1.0.1',
}
replacement.target.thread_id = replacement.thread.id
export const ReferenceEarlierIssueInNewFeedback: Story = {
  beforeEach: () => {
    sent.messages = []
    sent.states = []
  },
  render: () => (
    <div className="space-y-4">
      <FeedbackThread
        role="admin"
        nodeId="example"
        versionId={versionId}
        publisherId="example-publisher"
      />
      <FeedbackThread
        role="admin"
        nodeId="example"
        versionId={replacementId}
        publisherId="example-publisher"
      />
    </div>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(`*/admin/nodes/example/versions/${versionId}/feedback`, () => {
          const data = feedbackFixture(true)
          data.thread!.state = 'resolved'
          data.permissions = {
            can_start: false,
            can_reply: false,
            can_resolve: false,
            can_reopen: true,
          }
          data.last_read_message_seq = 1
          return HttpResponse.json(data)
        }),
        ...feedbackHandlers(true, 'empty', sent, replacement),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Copy Markdown reference' })
    )
    const markdown = copied
    const href = markdown.match(/\]\((.*)\)$/)![1]
    const input = await canvas.findByRole('textbox')
    await userEvent.click(input)
    await userEvent.paste(
      `The installation issue remains in 1.0.1. See ${markdown}.`
    )
    const preview = within(
      canvas.getByRole('region', { name: 'Message preview' })
    )
    expect(
      preview.getByRole('link', { name: 'example@1.0.0 feedback' })
    ).toHaveAttribute('href', href)
    expect(preview.getByRole('link')).toHaveAttribute(
      'rel',
      'noopener noreferrer'
    )
    expect(sent.messages).toHaveLength(0)
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await waitFor(() => expect(sent.messages).toHaveLength(1))
    expect(sent.messages[0].body).toBe(
      `The installation issue remains in 1.0.1. See ${markdown}.`
    )
    expect(sent.messages[0].target).toEqual({
      publisher_id: 'example-publisher',
      thread_id: null,
    })
    await waitFor(() =>
      expect(
        canvas.queryByRole('region', { name: 'Message preview' })
      ).toBeNull()
    )
    expect(
      canvas.getByRole('link', { name: 'example@1.0.0 feedback' })
    ).toHaveAttribute('href', href)
  },
}
