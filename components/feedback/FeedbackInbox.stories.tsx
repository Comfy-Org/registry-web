import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { http, HttpResponse } from 'msw'
import { FeedbackInbox } from './FeedbackInbox'
import { feedbackFixture, versionId } from './feedback.fixtures'
import { FeedbackThread } from './FeedbackThread'
import { Modal } from 'flowbite-react'
import { feedbackHandlers } from './feedback.mocks'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'

const authorFeedback = feedbackHandlers()
const adminFeedback = feedbackHandlers(true)
let queryClient: QueryClient
let inboxFailure: number | null = null
function CaptureQueryClient({ children }: { children: ReactNode }) {
  queryClient = useQueryClient()
  return <>{children}</>
}
function inboxHandler(admin: boolean, nextCursor: string | null = null) {
  return http.get(
    admin
      ? '*/admin/node-version-feedback'
      : '*/users/me/node-version-feedback',
    () =>
      inboxFailure
        ? HttpResponse.json(
            { message: 'Unavailable' },
            { status: inboxFailure }
          )
        : HttpResponse.json({
            threads: [
              { thread: feedbackFixture(admin).thread, unread_count: 1 },
            ],
            next_cursor: nextCursor,
          })
  )
}
const inboxQueries = {
  predicate: (query: { queryKey: readonly unknown[] }) =>
    query.queryKey.includes('inbox'),
}

const meta: Meta<typeof FeedbackInbox> = {
  title: 'Feedback/Inbox',
  component: FeedbackInbox,
  args: { role: 'author' },
  beforeEach: () => {
    authorFeedback.reset()
    adminFeedback.reset()
    inboxFailure = null
  },
  parameters: {
    msw: {
      handlers: [
        ...authorFeedback.handlers,
        http.get('*/users/me/node-version-feedback', () =>
          HttpResponse.json({
            threads: [{ thread: feedbackFixture().thread, unread_count: 1 }],
            next_cursor: null,
          })
        ),
      ],
    },
  },
  decorators: [
    (Story) => (
      <CaptureQueryClient>
        <div className="max-w-3xl bg-gray-900 p-6">
          <Story />
        </div>
      </CaptureQueryClient>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>
export const Author: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /example · v1.0.0/ })
    )
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog')
    )
    await userEvent.type(
      await dialog.findByLabelText('Private reply to the Registry team'),
      'The installation command is updated.'
    )
    await userEvent.click(dialog.getByRole('button', { name: 'Send reply' }))
    await expect(
      await within(dialog.getByLabelText('Feedback messages')).findByText(
        'The installation command is updated.'
      )
    ).toBeVisible()
  },
}
export const Admin: Story = {
  args: { role: 'admin' },
  parameters: {
    msw: {
      handlers: [
        ...adminFeedback.handlers,
        http.get('*/admin/node-version-feedback', () =>
          HttpResponse.json({
            threads: [
              { thread: feedbackFixture(true).thread, unread_count: 1 },
            ],
            next_cursor: null,
          })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('1 unread')).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: /example · v1.0.0/ })
    )
    const dialog = within(
      await within(canvasElement.ownerDocument.body).findByRole('dialog')
    )
    await expect(
      await dialog.findByLabelText('Private feedback to the author')
    ).toBeVisible()
    await expect(
      dialog.getByRole('button', { name: 'Resolve conversation' })
    ).toBeVisible()
    await expect(
      dialog.queryByLabelText('Private reply to the Registry team')
    ).toBeNull()
  },
}
export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/users/me/node-version-feedback', () =>
          HttpResponse.json({ threads: [], next_cursor: null })
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('No feedback conversations found.')
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: /example · v1.0.0/ })
    ).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Older conversations' })
    ).toBeNull()
  },
}

function filteredInboxStory(role: 'admin' | 'author'): Story {
  const threads = (
    ['awaiting_author', 'awaiting_admin', 'resolved'] as const
  ).map((state, index) => ({
    ...feedbackFixture(role === 'admin').thread!,
    id: crypto.randomUUID(),
    version_id: crypto.randomUUID(),
    version: ['2.0.0', '1.0.0', '0.9.0'][index],
    state,
  }))
  const requests: URL[] = []
  const cursor = 'older+page/1'
  return {
    args: { role, nodeId: 'example' },
    beforeEach: () => {
      requests.length = 0
    },
    parameters: {
      msw: {
        handlers: [
          http.get(
            role === 'admin'
              ? '*/admin/node-version-feedback'
              : '*/users/me/node-version-feedback',
            ({ request }) => {
              const url = new URL(request.url)
              requests.push(url)
              const state = url.searchParams.get('state')
              const older = url.searchParams.get('cursor')
              if (
                url.searchParams.get('nodeId') !== 'example' ||
                (older && older !== cursor)
              )
                return HttpResponse.json(
                  { message: 'Wrong inbox scope or cursor' },
                  { status: 422 }
                )
              return HttpResponse.json({
                threads: (state
                  ? threads.filter((thread) => thread.state === state)
                  : [threads[older ? 1 : 0]]
                ).map((thread) => ({ thread, unread_count: 0 })),
                next_cursor: !state && !older ? cursor : null,
              })
            }
          ),
        ],
      },
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      const expectPage = async (
        version: string,
        params: Record<string, string>
      ) => {
        await canvas.findByRole('button', {
          name: new RegExp(`example · v${version.replaceAll('.', '\\.')}`),
        })
        await waitFor(() =>
          expect(Object.fromEntries(requests.at(-1)!.searchParams)).toEqual({
            nodeId: 'example',
            ...params,
          })
        )
      }
      await expectPage('2.0.0', {})
      await userEvent.click(
        canvas.getByRole('button', { name: 'Older conversations' })
      )
      await expectPage('1.0.0', { cursor })
      expect(
        canvas.queryByRole('button', { name: /example · v2\.0\.0/ })
      ).toBeNull()
      expect(
        canvas.queryByRole('button', { name: 'Older conversations' })
      ).toBeNull()
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to latest' })
      )
      await expectPage('2.0.0', {})

      // Changing a filter from page two must discard its cursor.
      await userEvent.click(
        canvas.getByRole('button', { name: 'Older conversations' })
      )
      await expectPage('1.0.0', { cursor })
      for (const [state, version] of [
        ['resolved', '0.9.0'],
        ['awaiting_author', '2.0.0'],
        ['awaiting_admin', '1.0.0'],
        ['', '2.0.0'],
      ]) {
        await userEvent.selectOptions(
          canvas.getByLabelText('Conversation status'),
          state
        )
        await expectPage(version, state ? { state } : {})
        expect(
          canvas.queryByRole('button', { name: 'Back to latest' })
        ).toBeNull()
      }
      expect(
        canvas.getByRole('button', { name: 'Older conversations' })
      ).toBeVisible()
    },
  }
}
export const AuthorFiltersAndPaginates: Story = filteredInboxStory('author')
export const AdminFiltersAndPaginates: Story = filteredInboxStory('admin')

async function verifyAccessLoss(
  canvasElement: HTMLElement,
  admin: boolean,
  status: number
) {
  const canvas = within(canvasElement)
  const documentBody = within(canvasElement.ownerDocument.body)
  await userEvent.click(
    await canvas.findByRole('button', { name: /example · v1.0.0/ })
  )
  const dialog = within(await documentBody.findByRole('dialog'))
  const composerLabel = admin
    ? 'Private feedback to the author'
    : 'Private reply to the Registry team'
  const input = await dialog.findByLabelText(composerLabel)
  await userEvent.type(input, 'Already sent private message.')
  await userEvent.click(
    dialog.getByRole('button', { name: admin ? 'Send feedback' : 'Send reply' })
  )
  await within(dialog.getByLabelText('Feedback messages')).findByText(
    'Already sent private message.'
  )
  await userEvent.type(input, 'Unsent private draft.')
  await waitFor(() =>
    expect(
      queryClient
        .getMutationCache()
        .getAll()
        .every((m) => m.state.status !== 'pending')
    ).toBe(true)
  )
  expect(
    queryClient
      .getMutationCache()
      .findAll({ mutationKey: [PRIVATE_REGISTRY_KEY] }).length
  ).toBeGreaterThan(0)
  queryClient.setQueryData(['/nodes/example'], {
    tags_admin: ['any-code-execute'],
  })

  // Only the inbox detects access loss; the open thread has not polled yet.
  inboxFailure = status
  await queryClient.invalidateQueries(inboxQueries)
  await expect(
    await canvas.findByRole('alert', { hidden: true })
  ).toHaveTextContent('Could not load private feedback')
  await waitFor(() => {
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: [PRIVATE_REGISTRY_KEY] })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
    expect(
      queryClient
        .getMutationCache()
        .findAll({ mutationKey: [PRIVATE_REGISTRY_KEY] })
    ).toEqual([])
    expect(documentBody.queryByRole('dialog')).toBeNull()
    expect(documentBody.queryByText('Already sent private message.')).toBeNull()
  })
  expect(queryClient.getQueryData(['/nodes/example'])).toEqual({
    tags_admin: ['any-code-execute'],
  })

  // Reauthorization must fetch fresh data without restoring the selected thread or draft.
  inboxFailure = null
  await userEvent.click(canvas.getByRole('button', { name: 'Try again' }))
  const conversation = await canvas.findByRole('button', {
    name: /example · v1.0.0/,
  })
  expect(documentBody.queryByRole('dialog')).toBeNull()
  await userEvent.click(conversation)
  await expect(
    await within(await documentBody.findByRole('dialog')).findByLabelText(
      composerLabel
    )
  ).toHaveValue('')
}

export const RevokedAdminAccess: Story = {
  args: { role: 'admin' },
  parameters: {
    msw: { handlers: [...adminFeedback.handlers, inboxHandler(true)] },
  },
  play: async ({ canvasElement }) => verifyAccessLoss(canvasElement, true, 404),
}

export const ExpiredAuthorSession: Story = {
  parameters: {
    msw: { handlers: [...authorFeedback.handlers, inboxHandler(false)] },
  },
  play: async ({ canvasElement }) =>
    verifyAccessLoss(canvasElement, false, 401),
}

export const TemporaryInboxFailure: Story = {
  parameters: {
    msw: {
      handlers: [...authorFeedback.handlers, inboxHandler(false, 'older-page')],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const documentBody = within(canvasElement.ownerDocument.body)
    await expect(
      await canvas.findByRole('button', { name: 'Older conversations' })
    ).toBeVisible()
    await userEvent.click(
      await canvas.findByRole('button', { name: /example · v1.0.0/ })
    )
    const dialog = within(await documentBody.findByRole('dialog'))
    const input = await dialog.findByLabelText(
      'Private reply to the Registry team'
    )
    await userEvent.type(input, 'Keep this draft during a server outage.')
    await waitFor(() =>
      expect(
        queryClient
          .getMutationCache()
          .getAll()
          .every((m) => m.state.status !== 'pending')
      ).toBe(true)
    )
    inboxFailure = 500
    await queryClient.invalidateQueries(inboxQueries)
    await expect(
      await canvas.findByRole('alert', { hidden: true })
    ).toHaveTextContent('Could not load private feedback')
    expect(
      canvas.queryByRole('button', {
        name: 'Older conversations',
        hidden: true,
      })
    ).toBeNull()
    expect(input).toHaveValue('Keep this draft during a server outage.')
    expect(dialog.getByText(feedbackFixture().messages[0].body)).toBeVisible()
    expect(
      queryClient
        .getQueryCache()
        .findAll(inboxQueries)
        .some((query) => !!query.state.data)
    ).toBe(true)
    inboxFailure = null
    await queryClient.refetchQueries(inboxQueries)
    await waitFor(() =>
      expect(canvas.queryByRole('alert', { hidden: true })).toBeNull()
    )
    expect(
      canvas.getByRole('button', { name: 'Older conversations', hidden: true })
    ).toBeInTheDocument()
    expect(input).toHaveValue('Keep this draft during a server outage.')
  },
}

// The admin page opens version-card conversations separately from the inbox modal.
function AdminVersionWorkspace() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <FeedbackInbox role="admin" />
      <button onClick={() => setOpen(true)}>Open version feedback</button>
      <Modal show={open} onClose={() => setOpen(false)}>
        <Modal.Header>Version feedback</Modal.Header>
        <Modal.Body>
          <FeedbackThread role="admin" nodeId="example" versionId={versionId} />
        </Modal.Body>
      </Modal>
    </>
  )
}
let versionReads = 0
export const InboxDenialClearsSeparateVersionDialog: Story = {
  render: () => <AdminVersionWorkspace />,
  beforeEach: () => {
    versionReads = 0
  },
  parameters: {
    msw: {
      handlers: [
        inboxHandler(true),
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () => {
          versionReads += 1
          const data = feedbackFixture(true)
          data.last_read_message_seq = 1
          data.unread_count = 0
          if (versionReads > 1)
            data.messages[0].body = 'Fresh authorized conversation'
          return HttpResponse.json(data)
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: /example · v1.0.0/ })
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open version feedback' })
    )
    const body = within(canvasElement.ownerDocument.body)
    const dialog = within(await body.findByRole('dialog'))
    await dialog.findByText(feedbackFixture().messages[0].body)
    await userEvent.type(
      dialog.getByRole('textbox'),
      'Private draft before admin revocation.'
    )
    const identity = queryClient.getQueryCache().findAll(inboxQueries)[0]
      .queryKey[1]
    const otherRole = [PRIVATE_REGISTRY_KEY, identity, 'author', 'unrelated']
    const otherIdentity = [
      PRIVATE_REGISTRY_KEY,
      'other-user',
      'admin',
      'unrelated',
    ]
    queryClient.setQueryData(otherRole, { body: 'Other role' })
    queryClient.setQueryData(otherIdentity, { body: 'Other identity' })

    inboxFailure = 404
    await queryClient.invalidateQueries(inboxQueries)
    await canvas.findByRole('alert', { hidden: true })
    await waitFor(() =>
      expect(body.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    )
    expect(dialog.queryByRole('textbox')).toBeNull()
    expect(versionReads).toBe(1) // No second thread request is needed to hide the old content.
    expect(queryClient.getQueryData(otherRole)).toEqual({ body: 'Other role' })
    expect(queryClient.getQueryData(otherIdentity)).toEqual({
      body: 'Other identity',
    })
    expect(
      queryClient
        .getQueryCache()
        .findAll({ queryKey: [PRIVATE_REGISTRY_KEY, identity, 'admin'] })
        .every((query) => query.state.data === undefined)
    ).toBe(true)

    inboxFailure = null
    await userEvent.click(dialog.getByRole('button', { name: 'Try again' }))
    await expect(
      await dialog.findByText('Fresh authorized conversation')
    ).toBeVisible()
    expect(dialog.getByRole('textbox')).toHaveValue('')
    expect(dialog.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    // Recovering a single conversation does not implicitly reopen the denied inbox.
    expect(canvas.getByRole('alert', { hidden: true })).toBeInTheDocument()
  },
}
