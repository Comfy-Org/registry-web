import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, spyOn, userEvent, within, waitFor } from 'storybook/test'
import { FeedbackThread } from './FeedbackThread'
import { feedbackFixture, versionId } from './feedback.fixtures'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'
import type {
  FeedbackResponse,
  FeedbackReadInput,
} from '@/src/api/feedback.generated'

let latest = 31
function snapshot(before?: number) {
  const result = feedbackFixture()
  const end = before ? before - 1 : latest
  const start = Math.max(1, end - 29)
  result.thread!.last_message_seq = latest
  result.messages = Array.from({ length: end - start + 1 }, (_, i) => ({
    ...feedbackFixture().messages[0],
    id: `message-${i + start}`,
    seq: i + start,
    body: `Review message ${i + start}`,
  }))
  result.next_before_seq = start > 1 ? start : null
  result.last_read_message_seq = latest
  return result
}
function PollingConversation() {
  const client = useQueryClient()
  return (
    <div>
      <button
        onClick={() => {
          latest += 1
          void client.invalidateQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
        }}
      >
        Simulate next poll
      </button>
      <button
        onClick={() => {
          latest += 40
          void client.invalidateQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
        }}
      >
        Simulate busy conversation
      </button>
      <FeedbackThread
        role="author"
        nodeId="example"
        versionId={versionId}
        publisherId="example-publisher"
      />
    </div>
  )
}
const meta: Meta<typeof PollingConversation> = {
  title: 'Feedback/Regressions',
  component: PollingConversation,
  beforeEach: () => {
    latest = 31
  },
  parameters: {
    msw: {
      handlers: [
        http.get(
          '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback',
          ({ request }) => {
            const before = new URL(request.url).searchParams.get('before_seq')
            return HttpResponse.json(
              snapshot(before ? Number(before) : undefined)
            )
          }
        ),
        http.post(/\/feedback\/read$/, async ({ request }) =>
          HttpResponse.json(await request.json())
        ),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const PollsWithoutUserInteraction: Story = {
  beforeEach: () => {
    const clock: Window = window
    const setInterval = clock.setInterval.bind(clock)
    // Accelerate only the advertised 25-second browser interval.
    // The real query observer must schedule it and perform the HTTP read.
    const timer = spyOn(clock, 'setInterval').mockImplementation(
      (handler, delay, ...args) =>
        setInterval(handler, delay === 25000 ? 100 : delay, ...args)
    )
    return () => timer.mockRestore()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Review message 31')
    latest = 32
    // No button click, cache invalidation or manual refetch triggers this update.
    await expect(
      await canvas.findByText('Review message 32')
    ).toBeInTheDocument()
    expect(canvas.getByText('Review message 31')).toBeInTheDocument()
  },
}

let readClient: QueryClient
let readRequests: FeedbackReadInput[] = []
let readFailure: number | null = null
let getFailure = false
let acknowledged = 0
let fetched = 0
function resetReadRecovery(failure: number | null = null) {
  readRequests = []
  readFailure = failure
  getFailure = false
  acknowledged = 0
  fetched = 0
}
function ReadRecoveryConversation() {
  readClient = useQueryClient()
  return (
    <div data-testid="read-viewport" style={{ height: 600, overflow: 'auto' }}>
      <FeedbackThread
        role="author"
        nodeId="example"
        versionId={versionId}
        publisherId="example-publisher"
      />
      <div style={{ height: 800 }} />
    </div>
  )
}
const readRecoveryHandlers = [
  http.get(
    '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback',
    () => {
      fetched += 1
      if (getFailure)
        return HttpResponse.json(
          { message: 'Temporary failure' },
          { status: 500 }
        )
      return HttpResponse.json({
        ...feedbackFixture(),
        last_read_message_seq: acknowledged,
        unread_count: acknowledged ? 0 : 1,
      })
    }
  ),
  http.post(/\/feedback\/read$/, async ({ request }) => {
    const input = (await request.json()) as FeedbackReadInput
    readRequests.push(input)
    if (readFailure)
      return HttpResponse.json(
        { message: 'Unavailable' },
        { status: readFailure }
      )
    acknowledged = input.last_read_message_seq
    return HttpResponse.json({ last_read_message_seq: acknowledged })
  }),
]
async function waitForReadFailure(attempts: number) {
  await waitFor(() => {
    expect(readRequests).toHaveLength(attempts)
    expect(
      readClient
        .getMutationCache()
        .getAll()
        .filter((m) => m.state.status === 'error')
    ).toHaveLength(attempts)
  })
  // A failed acknowledgement must wait for a new successful GET, not loop immediately.
  await new Promise((resolve) => setTimeout(resolve, 150))
  expect(readRequests).toHaveLength(attempts)
}
export const RetriesReadAfterSuccessfulPolling: Story = {
  render: () => <ReadRecoveryConversation />,
  beforeEach: () => resetReadRecovery(500),
  parameters: { msw: { handlers: readRecoveryHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = await canvas.findByText(feedbackFixture().messages[0].body)
    await waitForReadFailure(1)
    // Already observed messages remain eligible if the reader scrolls away before retry.
    const viewport = canvas.getByTestId('read-viewport')
    viewport.scrollTop = viewport.scrollHeight
    await waitFor(() =>
      expect(message.getBoundingClientRect().bottom).toBeLessThan(
        viewport.getBoundingClientRect().top
      )
    )
    readFailure = 429
    // Identical data retains its reference through React Query structural sharing.
    await readClient.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await waitForReadFailure(2)
    expect(acknowledged).toBe(0)

    getFailure = true
    await readClient.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await within(canvasElement).findByRole('alert')
    expect(readRequests).toHaveLength(2)

    getFailure = false
    readFailure = null
    await readClient.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await waitFor(() => expect(acknowledged).toBe(1))
    expect(readRequests).toEqual(
      Array.from({ length: 3 }, () => ({
        target: feedbackFixture().target,
        last_read_message_seq: 1,
      }))
    )
    await waitFor(() =>
      expect(
        readClient
          .getQueryCache()
          .findAll({ queryKey: [PRIVATE_REGISTRY_KEY] })[0].state.data
      ).toMatchObject({ last_read_message_seq: 1, unread_count: 0 })
    )
    expect(fetched).toBeGreaterThanOrEqual(4)
  },
}

export const ReadAccessDenialStopsPolling: Story = {
  ...RetriesReadAfterSuccessfulPolling,
  beforeEach: () => resetReadRecovery(403),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('alert')
    expect(canvas.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    expect(canvas.queryByRole('textbox')).toBeNull()
    await readClient.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    expect(fetched).toBe(1)
    expect(readRequests).toHaveLength(1)
    expect(acknowledged).toBe(0)
    expect(readClient.getMutationCache().getAll()).toEqual([])
  },
}

let tabHidden = false
export const HiddenTabWaitsToAcknowledge: Story = {
  render: () => <ReadRecoveryConversation />,
  beforeEach: () => {
    resetReadRecovery()
    tabHidden = true
    const hidden = spyOn(document, 'hidden', 'get').mockImplementation(
      () => tabHidden
    )
    const visibility = spyOn(
      document,
      'visibilityState',
      'get'
    ).mockImplementation(() => (tabHidden ? 'hidden' : 'visible'))
    return () => {
      hidden.mockRestore()
      visibility.mockRestore()
    }
  },
  parameters: { msw: { handlers: readRecoveryHandlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(feedbackFixture().messages[0].body)
    await waitFor(() => expect(readClient.isFetching()).toBe(0))
    // Allow native intersection callbacks to run even though the tab is hidden.
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(readRequests).toEqual([])
    expect(acknowledged).toBe(0)

    tabHidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    await waitFor(() => expect(acknowledged).toBe(1))
    expect(readRequests).toEqual([
      { target: feedbackFixture().target, last_read_message_seq: 1 },
    ])
  },
}

export const KeepsLoadedMessagesAfterPolling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Load earlier messages' })
    )
    await expect(
      await canvas.findByText('Review message 1')
    ).toBeInTheDocument()
    await expect(canvas.getByText('Review message 2')).toBeInTheDocument()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Simulate next poll' })
    )
    await expect(
      await canvas.findByText('Review message 32')
    ).toBeInTheDocument()
    await expect(canvas.queryByText('Review message 2')).toBeInTheDocument()
    // More than one page arrives between polls: all gaps must remain reachable.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Simulate busy conversation' })
    )
    await expect(
      await canvas.findByText('Review message 72')
    ).toBeInTheDocument()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load earlier messages' })
    )
    await expect(
      await canvas.findByText('Review message 33')
    ).toBeInTheDocument()
    for (let seq = 1; seq <= 72; seq++)
      await expect(
        canvas.getByText(`Review message ${seq}`)
      ).toBeInTheDocument()
    await expect(
      canvas.queryByRole('button', { name: 'Load earlier messages' })
    ).toBeNull()
  },
}

const recordedReads: FeedbackReadInput[] = []
let lastRead = 0
export const DoesNotReadClippedMessages: Story = {
  beforeEach: () => {
    recordedReads.length = 0
    lastRead = 0
  },
  render: () => (
    <div data-testid="clip" style={{ height: 100, overflow: 'auto' }}>
      <div style={{ height: 150 }} />
      <FeedbackThread
        role="author"
        nodeId="example"
        versionId={versionId}
        publisherId="example-publisher"
      />
    </div>
  ),
  parameters: {
    msw: {
      handlers: [
        http.get(
          '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback',
          () =>
            HttpResponse.json({
              ...feedbackFixture(),
              last_read_message_seq: lastRead,
            })
        ),
        http.post(/\/feedback\/read$/, async ({ request }) => {
          const body = (await request.json()) as FeedbackReadInput
          recordedReads.push(body)
          lastRead = body.last_read_message_seq
          return HttpResponse.json({ last_read_message_seq: lastRead })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = (
      await canvas.findByText(feedbackFixture().messages[0].body)
    ).closest('article')!
    const clip = canvas.getByTestId('clip')
    await expect(message.getBoundingClientRect().top).toBeGreaterThan(
      clip.getBoundingClientRect().bottom
    )
    // Allow effects and observers to run: merely mounting clipped content must not acknowledge it.
    await new Promise((resolve) => setTimeout(resolve, 150))
    await expect(recordedReads).toEqual([])
    clip.scrollTop +=
      message.getBoundingClientRect().top - clip.getBoundingClientRect().top
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    )
    clip.scrollTop +=
      message.getBoundingClientRect().bottom -
      clip.getBoundingClientRect().bottom
    await waitFor(() =>
      expect(recordedReads).toEqual([
        { target: feedbackFixture().target, last_read_message_seq: 1 },
      ])
    )
  },
}

let current: FeedbackResponse
function TransferConversation() {
  const client = useQueryClient()
  return (
    <div>
      <button
        onClick={() => {
          current = feedbackFixture(true)
          current.target = {
            publisher_id: 'new-publisher',
            thread_id: '33333333-3333-4333-8333-333333333333',
          }
          current.thread = {
            ...current.thread!,
            publisher_id: current.target.publisher_id,
            id: current.target.thread_id!,
          }
          current.messages[0].body = 'New Publisher conversation'
          current.last_read_message_seq = 1
          void client.invalidateQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
        }}
      >
        Transfer Publisher
      </button>
      <FeedbackThread role="admin" nodeId="example" versionId={versionId} />
    </div>
  )
}
export const ClearsDraftAndHistoryOnRecipientChange: Story = {
  render: () => <TransferConversation />,
  beforeEach: () => {
    current = feedbackFixture(true)
    current.last_read_message_seq = 1
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () =>
          HttpResponse.json(current)
        ),
        http.post(/\/feedback\/read$/, async ({ request }) =>
          HttpResponse.json(await request.json())
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByLabelText('Private feedback to the author'),
      'Private draft for original Publisher'
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Transfer Publisher' })
    )
    await expect(
      await canvas.findByText('New Publisher conversation')
    ).toBeInTheDocument()
    await expect(
      canvas.queryByText(feedbackFixture().messages[0].body)
    ).toBeNull()
    await expect(canvas.getByRole('textbox')).toHaveValue('')
    await expect(
      canvas.getByRole('button', { name: 'Send feedback' })
    ).toBeDisabled()
  },
}

export const ReadsLongMessageOnlyAfterBothEndsAppear: Story = {
  ...DoesNotReadClippedMessages,
  parameters: {
    msw: {
      handlers: [
        http.get(
          '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback',
          () => {
            const data = feedbackFixture()
            data.messages[0].body = Array.from(
              { length: 40 },
              (_, i) => `Long reply line ${i + 1}`
            ).join('\n')
            data.last_read_message_seq = lastRead
            return HttpResponse.json(data)
          }
        ),
        http.post(/\/feedback\/read$/, async ({ request }) => {
          const body = (await request.json()) as FeedbackReadInput
          recordedReads.push(body)
          lastRead = body.last_read_message_seq
          return HttpResponse.json({ last_read_message_seq: lastRead })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const message = (await canvas.findByText(/Long reply line 1/)).closest(
      'article'
    )!
    const clip = canvas.getByTestId('clip')
    const scrollTo = async (edge: 'start' | 'end') => {
      const root = canvas.getByLabelText('Feedback messages')
      clip.scrollTop +=
        root.getBoundingClientRect().top - clip.getBoundingClientRect().top
      root.scrollTop = edge === 'end' ? root.scrollHeight : 0
      if (edge === 'end')
        clip.scrollTop +=
          message.getBoundingClientRect().bottom -
          clip.getBoundingClientRect().bottom
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    await scrollTo('start')
    await expect(message.getBoundingClientRect().bottom).toBeGreaterThan(
      clip.getBoundingClientRect().bottom
    )
    await expect(recordedReads).toEqual([])
    await scrollTo('end')
    await waitFor(() =>
      expect(recordedReads).toEqual([
        { target: feedbackFixture().target, last_read_message_seq: 1 },
      ])
    )
  },
}
