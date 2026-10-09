import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { afterEach as checkAccessibility } from '@storybook/addon-a11y/preview'
import { getRouter } from '@storybook/nextjs-vite/router.mock'
import { QueryClient, useQueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, within, waitFor, spyOn } from 'storybook/test'
import AdminNodeVersions from '@/pages/admin/nodeversions'
import { feedbackFixture, versionId } from './feedback.fixtures'
import type { FeedbackReadInput } from '@/src/api/feedback.generated'

let client: QueryClient
let versionError: number | null = null
let inboxError: number | null = null
let scanError: number | null = null
let scanPageGate: Promise<void> | undefined
let releaseScanPage: () => void
let readSeq = 1
let versionRequests: URL[] = []
let requests = { versions: 0, scans: 0, inbox: 0, reads: 0 }
function AdminPage() {
  client = useQueryClient()
  return <AdminNodeVersions />
}
const meta: Meta<typeof AdminPage> = {
  title: 'Feedback/Admin page',
  component: AdminPage,
  beforeEach: () => {
    versionError = null
    inboxError = null
    scanError = null
    scanPageGate = undefined
    readSeq = 1
    versionRequests = []
    requests = { versions: 0, scans: 0, inbox: 0, reads: 0 }
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/admin/nodeversions',
        asPath: '/admin/nodeversions',
        query: {},
      },
    },
    msw: {
      handlers: [
        http.get('*/users', () =>
          HttpResponse.json({
            id: 'firebase-user-123',
            isAdmin: true,
            name: 'Admin',
          })
        ),
        http.get('*/admin/nodeversions', async ({ request }) => {
          const url = new URL(request.url)
          const pageSize = Number(url.searchParams.get('pageSize'))
          const page = Number(url.searchParams.get('page') ?? 1)
          const isScan = pageSize === 100
          versionRequests.push(url)
          requests[isScan ? 'scans' : 'versions'] += 1
          if (isScan && page === 2) await scanPageGate
          // Revoke access on a later page after the first page has succeeded.
          const error = isScan ? (page > 1 ? scanError : null) : versionError
          if (error)
            return HttpResponse.json(
              { message: 'Version list unavailable' },
              { status: error }
            )
          const version = {
            id: versionId,
            node_id: 'example',
            version: '1.0.0',
            status: 'NodeVersionStatusFlagged',
            status_reason: 'Fictional scan',
            tags_admin: [],
          }
          const versions = isScan
            ? Array.from({ length: 201 }, (_, i) => ({
                ...version,
                id: i === 0 ? versionId : `scan-version-${i}`,
                version: `1.${i}.0`,
              })).slice((page - 1) * pageSize, page * pageSize)
            : [version]
          return HttpResponse.json({
            versions,
            total: isScan ? 201 : 1,
            totalPages: isScan ? 3 : 1,
            page,
            pageSize,
          })
        }),
        http.get('*/admin/node-version-feedback', () => {
          requests.inbox += 1
          return inboxError
            ? HttpResponse.json(
                { message: 'Access denied' },
                { status: inboxError }
              )
            : HttpResponse.json({
                threads: [
                  {
                    thread: feedbackFixture(true).thread,
                    unread_count: 1 - readSeq,
                  },
                ],
                next_cursor: null,
              })
        }),
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () =>
          HttpResponse.json({
            ...feedbackFixture(true),
            last_read_message_seq: readSeq,
            unread_count: 1 - readSeq,
          })
        ),
        http.post(
          '*/admin/nodes/:nodeId/versions/:versionId/feedback/read',
          async ({ request }) => {
            const input = (await request.json()) as FeedbackReadInput
            requests.reads += 1
            readSeq = Math.max(readSeq, input.last_read_message_seq)
            return HttpResponse.json({ last_read_message_seq: readSeq })
          }
        ),
        http.get('*/nodes/example', () =>
          HttpResponse.json({
            id: 'example',
            name: 'Example',
            publisher: { id: 'example-publisher' },
            repository: 'https://example.invalid/repo',
          })
        ),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>
export const PrivateReviewControlsHaveReadableContrast: Story = {
  decorators: [
    (Story) => (
      <div className="bg-gray-900">
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: {
      context: {
        include: [
          '[aria-label="Feedback inbox"]',
          'details[data-private] > summary',
        ],
      },
      options: { runOnly: ['color-contrast'] },
    },
  },
  play: async (context) => {
    const canvas = within(context.canvasElement)
    await expect(
      await canvas.findByRole('button', { name: /example · v1.0.0/ })
    ).toBeVisible()
    await expect(
      await canvas.findByText('Scan results · Admin only')
    ).toBeVisible()
    await checkAccessibility(context)
    expect(
      context.reporting.reports.find((report) => report.type === 'a11y')
    ).toMatchObject({ status: 'passed', result: { violations: [] } })
  },
}
export const HandlingFilterPreservesOtherFiltersAndClearsSelection: Story = {
  parameters: {
    nextjs: {
      router: {
        query: {
          page: '3',
          nodeId: 'example',
          filter: ['flagged', 'pending'],
          statusReason: 'scan-marker',
          feedbackStatus: 'processed',
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('button', { name: 'Private feedback' })
    const expectRequest = (status: string, page: string) => {
      const params = versionRequests.at(-1)!.searchParams
      expect(params.get('feedback_status')).toBe(status || null)
      expect(params.get('nodeId')).toBe('example')
      expect(params.get('include_status_reason')).toBe('true')
      expect(params.get('include_deleted')).toBe('false')
      expect(params.get('status_reason')).toBe('scan-marker')
      expect(params.get('page')).toBe(page)
      expect(params.getAll('statuses').sort()).toEqual([
        'NodeVersionStatusFlagged',
        'NodeVersionStatusPending',
      ])
    }
    expectRequest('processed', '3')
    // Storybook's router only records pushes. Apply the resulting URL so the
    // component's next render also exercises the outgoing API request.
    const router = getRouter()
    router.push.mockImplementation(async (url) => {
      if (typeof url !== 'string')
        router.query = url.query as typeof router.query
      return true
    })
    const checkbox = canvas.getAllByRole('checkbox').at(-1)!
    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()
    for (const value of ['', 'needs_response', 'unprocessed', 'processed']) {
      await userEvent.selectOptions(
        await canvas.findByLabelText('Feedback handling status'),
        value
      )
      expect(getRouter().push).toHaveBeenLastCalledWith(
        {
          pathname: '/admin/nodeversions',
          query: {
            page: '1',
            nodeId: 'example',
            filter: ['flagged', 'pending'],
            statusReason: 'scan-marker',
            ...(value ? { feedbackStatus: value } : {}),
          },
        },
        undefined,
        { shallow: false }
      )
      await canvas.findByRole('button', { name: 'Private feedback' })
      await waitFor(() => expectRequest(value, '1'))
      expect(canvas.getAllByRole('checkbox').at(-1)).not.toBeChecked()
    }
  },
}
export const ReadingFeedbackDoesNotReloadVersionReports: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    readSeq = 0
    await canvas.findByRole('button', { name: /example · v1.0.0/ })
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('inbox'),
    })
    await canvas.findByText('1 unread')
    await userEvent.click(await canvas.findByText('Scan results · Admin only'))
    await waitFor(() => expect(requests.scans).toBeGreaterThan(0))
    await waitFor(() => expect(client.isFetching()).toBe(0))
    const before = { ...requests }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Private feedback' })
    )
    await within(canvasElement.ownerDocument.body).findByRole('textbox')
    await waitFor(() => expect(requests.reads).toBeGreaterThan(0))
    await waitFor(() => expect(client.isMutating()).toBe(0))
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(canvas.queryByText('1 unread')).toBeNull()
    expect(requests.inbox).toBeGreaterThan(before.inbox)
    expect(requests.versions).toBe(before.versions)
    expect(requests.scans).toBe(before.scans)
  },
}
export const VersionListFailureKeepsFeedbackDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Private feedback' })
    )
    const body = within(canvasElement.ownerDocument.body)
    const dialog = within(await body.findByRole('dialog'))
    await userEvent.type(
      await dialog.findByRole('textbox'),
      'Unsent feedback should survive a list outage.'
    )
    versionError = 500
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('admin-versions'),
    })
    await waitFor(() =>
      expect(
        client.getQueryCache().findAll({
          predicate: (query) => query.queryKey.includes('admin-versions'),
        })[0].state.status
      ).toBe('error')
    )
    expect(body.queryByRole('dialog')).not.toBeNull()
    expect(body.getByRole('textbox')).toHaveValue(
      'Unsent feedback should survive a list outage.'
    )
    versionError = null
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('admin-versions'),
    })
    await waitFor(() =>
      expect(
        client.getQueryCache().findAll({
          predicate: (query) => query.queryKey.includes('admin-versions'),
        })[0].state.status
      ).toBe('success')
    )
    expect(body.getByRole('textbox')).toHaveValue(
      'Unsent feedback should survive a list outage.'
    )
  },
}

export const VersionListDenialClosesVersionConversation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Private feedback' })
    )
    const body = within(canvasElement.ownerDocument.body)
    const dialog = within(await body.findByRole('dialog'))
    await userEvent.type(
      await dialog.findByRole('textbox'),
      'Discard after access loss.'
    )
    versionError = 404
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('admin-versions'),
    })
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    expect(body.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    versionError = null
    const listError = canvas
      .getAllByRole('alert')
      .find((alert) =>
        alert.textContent?.includes('Error getting node versions')
      )!
    await userEvent.click(
      within(listError).getByRole('button', { name: 'Try again' })
    )
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Private feedback' })
    )
    expect(
      await within(await body.findByRole('dialog')).findByRole('textbox')
    ).toHaveValue('')
  },
}

export const VersionListDenialClosesInboxConversation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: /example · v1.0.0/ })
    )
    const body = within(canvasElement.ownerDocument.body)
    const dialog = within(await body.findByRole('dialog'))
    await userEvent.type(
      await dialog.findByRole('textbox'),
      'Discard the inbox draft after role revocation.'
    )
    versionError = 404
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('admin-versions'),
    })
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    expect(body.queryByText(feedbackFixture().messages[0].body)).toBeNull()
    expect(
      client
        .getQueryCache()
        .findAll({
          predicate: (query) => query.queryKey[0] === 'registry-private',
        })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
  },
}

export const InboxDenialClearsVersionReports: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Scan results · Admin only')
    await canvas.findByRole('button', { name: /example · v1.0.0/ })
    const roleKey = ['registry-private', 'firebase-user-123', 'author', 'other']
    client.setQueryData(roleKey, { body: 'Authorized owner conversation' })
    inboxError = 403
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('inbox'),
    })
    await waitFor(() =>
      expect(canvas.queryByText('Scan results · Admin only')).toBeNull()
    )
    expect(
      client
        .getQueryCache()
        .findAll({
          queryKey: ['registry-private', 'firebase-user-123', 'admin'],
        })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
    expect(client.getQueryData(roleKey)).toEqual({
      body: 'Authorized owner conversation',
    })
  },
}
export const ScanHistoryDenialClosesFeedback: Story = {
  beforeEach: () => {
    const clock: Window = window
    const setInterval = clock.setInterval.bind(clock)
    const timer = spyOn(clock, 'setInterval').mockImplementation(
      (handler, delay, ...args) =>
        setInterval(handler, delay === 25000 ? 100 : delay, ...args)
    )
    return () => timer.mockRestore()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByText('Scan results · Admin only'))
    await waitFor(() =>
      expect(
        client.getQueryCache().findAll({
          predicate: (query) => query.queryKey.includes('scan-history'),
        })[0]?.state.status
      ).toBe('success')
    )
    await userEvent.click(
      canvas.getByRole('button', { name: 'Private feedback' })
    )
    const body = within(canvasElement.ownerDocument.body)
    const dialog = within(await body.findByRole('dialog'))
    await userEvent.type(
      await dialog.findByRole('textbox'),
      'Discard after scan endpoint revokes access.'
    )
    // Positive control: the mounted scan panel really does poll automatically.
    await waitFor(() => expect(requests.scans).toBeGreaterThan(3))
    scanError = 401
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('scan-history'),
    })
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
    expect(canvas.queryByText('Scan results · Admin only')).toBeNull()
    expect(
      client
        .getQueryCache()
        .findAll({
          queryKey: ['registry-private', 'firebase-user-123', 'admin'],
        })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
    const stoppedAt = requests.scans
    // Observe several accelerated polling periods after the panel is unmounted.
    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(requests.scans).toBe(stoppedAt)
    expect(canvas.queryByText('Scan results · Admin only')).toBeNull()
  },
}

export const AccessLossCancelsRemainingScanPages: Story = {
  beforeEach: () => {
    scanPageGate = new Promise<void>((resolve) => {
      releaseScanPage = resolve
    })
    return () => releaseScanPage()
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await canvas.findByText('Scan results · Admin only'))
    await waitFor(() => expect(requests.scans).toBe(2))
    versionError = 403
    await client.refetchQueries({
      predicate: (query) => query.queryKey.includes('admin-versions'),
    })
    await waitFor(() =>
      expect(canvas.queryByText('Scan results · Admin only')).toBeNull()
    )
    releaseScanPage()
    // A late response must neither restore private data nor fetch page three.
    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(requests.scans).toBe(2)
    expect(
      client
        .getQueryCache()
        .findAll({
          queryKey: ['registry-private', 'firebase-user-123', 'admin'],
        })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
  },
}

export const ReplacementVersionLookup: Story = {
  parameters: {
    nextjs: { router: { query: { nodeId: 'example', version: '1.0.0' } } },
  },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', {
      name: 'Private feedback',
    })
    const request = versionRequests.find(
      (url) => url.searchParams.get('pageSize') === '8'
    )!
    expect(request.searchParams.get('nodeId')).toBe('example')
    expect(request.searchParams.get('version')).toBe('1.0.0')
    expect(request.searchParams.get('include_status_reason')).toBe('true')
    expect(request.searchParams.get('include_deleted')).toBe('true')
  },
}
