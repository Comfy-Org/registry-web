import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import NodeDetails from '@/components/nodes/NodeDetails'
import { feedbackFixture, versionId } from './feedback.fixtures'
import type { FeedbackSupersedeInput } from '@/src/api/feedback.generated'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'

let client: QueryClient
let canEdit = true
let isAdmin = false
let memberRole = 'owner'
let publisherStatus = 200
let releasePublisher: (() => void) | undefined
let holdPublisher = false
let threadRequests: URL[] = []
let messageRequests: URL[] = []
let acceptReply = false
let inboxError: number | null = null
let repeatCursor = false
let resolved = false
let requests: URL[] = []
let supersedeStatus = 204
let supersedeCalls: { url: string; body: FeedbackSupersedeInput }[] = []
let deprecated: string[] = []
let versionRequests: Request[] = []
let versionsReady = Promise.resolve()
let releaseVersions: (() => void) | undefined
const publisher = { id: 'example-publisher', name: 'Example Publisher' }
const versions = ['1.0.0', '0.9.0', '0.8.0', '0.7.0', '0.6.0'].map(
  (version, index) => ({
    id:
      index === 0
        ? versionId
        : `55555555-5555-4555-8555-${String(index).padStart(12, '0')}`,
    node_id: 'example',
    version,
    createdAt: `2026-09-${29 - index}T09:00:00Z`,
    status: 'NodeVersionStatusFlagged',
    changelog: 'Installation improvements.',
  })
)
let uploadedVersion: (typeof versions)[number] | null = null
let feedbackRevision = 1
function AuthorPage() {
  client = useQueryClient()
  return <NodeDetails />
}
function NavigableAuthorPage() {
  const router = useRouter()
  const [nodeId, setNodeId] = useState('example')
  return (
    <>
      <button onClick={() => setNodeId('another')}>Next nodepack</button>
      <RouterContext.Provider
        value={{ ...router, query: { ...router.query, nodeId } }}
      >
        <AuthorPage />
      </RouterContext.Provider>
    </>
  )
}
const meta: Meta<typeof AuthorPage> = {
  title: 'Feedback/Author page',
  component: AuthorPage,
  beforeEach: () => {
    canEdit = true
    isAdmin = false
    memberRole = 'owner'
    publisherStatus = 200
    releasePublisher = undefined
    holdPublisher = false
    threadRequests = []
    messageRequests = []
    acceptReply = false
    inboxError = null
    repeatCursor = false
    resolved = false
    requests = []
    supersedeCalls = []
    supersedeStatus = 204
    deprecated = []
    versionRequests = []
    versionsReady = Promise.resolve()
    releaseVersions = undefined
    uploadedVersion = null
    feedbackRevision = 1
  },
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      router: {
        pathname: '/publishers/[publisherId]/nodes/[nodeId]',
        query: { publisherId: publisher.id, nodeId: 'example' },
      },
    },
    msw: {
      handlers: [
        http.get('*/publishers/example-publisher', async () => {
          if (holdPublisher)
            await new Promise<void>((resolve) => {
              releasePublisher = resolve
            })
          return HttpResponse.json(
            {
              ...publisher,
              members: [
                { user: { id: 'another-owner' }, role: 'owner' },
                { user: { id: 'firebase-user-123' }, role: memberRole },
              ],
            },
            { status: publisherStatus }
          )
        }),
        http.get('*/nodes/:nodeId', ({ params }) =>
          HttpResponse.json({
            id: params.nodeId,
            name:
              params.nodeId === 'example'
                ? 'Example Nodepack'
                : 'Another Nodepack',
            publisher,
            description: 'Private feedback on version reviews.',
            status: 'NodeStatusActive',
            latest_version: uploadedVersion ?? versions[0],
          })
        ),
        http.get('*/nodes/:nodeId/versions', async ({ request }) => {
          versionRequests.push(request)
          await versionsReady
          return HttpResponse.json(
            (uploadedVersion ? [uploadedVersion, ...versions] : versions).map(
              (v) => ({
                ...v,
                deprecated: deprecated.includes(v.id),
              })
            )
          )
        }),
        http.post(
          '*/publishers/:publisherId/nodes/:nodeId/versions/:versionId/feedback/supersede',
          async ({ request }) => {
            const body = (await request.json()) as FeedbackSupersedeInput
            supersedeCalls.push({ url: request.url, body })
            if (supersedeStatus !== 204)
              return HttpResponse.json(
                { message: 'Conversation changed' },
                { status: supersedeStatus }
              )
            deprecated = body.versions.map((v) => v.version_id)
            return new HttpResponse(null, { status: 204 })
          }
        ),
        http.get('*/nodes/:nodeId/versions/1.0.0', () =>
          HttpResponse.json(versions[0])
        ),
        http.get(/\/versions\/[^/]+\/feedback$/, ({ request }) => {
          const url = new URL(request.url)
          threadRequests.push(url)
          return HttpResponse.json({
            ...feedbackFixture(url.pathname.startsWith('/admin/')),
            last_read_message_seq: 1,
            unread_count: 0,
          })
        }),
        http.post(/\/feedback\/messages$/, ({ request }) => {
          const url = new URL(request.url)
          messageRequests.push(url)
          return acceptReply
            ? HttpResponse.json(
                feedbackFixture(url.pathname.startsWith('/admin/'))
              )
            : HttpResponse.json({ message: 'Access denied' }, { status: 404 })
        }),
        http.get('*/users', () =>
          HttpResponse.json({ id: 'firebase-user-123', isAdmin })
        ),
        http.get('*/users/publishers', () =>
          HttpResponse.json(canEdit ? [publisher] : [])
        ),
        http.get(
          '*/publishers/example-publisher/nodes/:nodeId/permissions',
          () => HttpResponse.json({ canEdit })
        ),
        http.get(
          /\/(?:users\/me|admin)\/node-version-feedback$/,
          ({ request }) => {
            const url = new URL(request.url)
            requests.push(url)
            // Bound a broken client's traffic so this regression cannot loop forever.
            if (repeatCursor && requests.length > 2)
              return HttpResponse.json(
                { message: 'Unexpected repeated request' },
                { status: 500 }
              )
            if (inboxError)
              return HttpResponse.json(
                { message: 'Access denied' },
                { status: inboxError }
              )
            const states = [
              resolved ? 'resolved' : 'awaiting_author',
              'resolved',
              'awaiting_admin',
              'awaiting_author',
            ]
            const indices = url.searchParams.has('cursor') ? [2, 3] : [0, 1]
            return HttpResponse.json({
              threads: indices.map((index) => ({
                thread: {
                  ...feedbackFixture().thread,
                  node_id: url.searchParams.get('nodeId'),
                  id: versions[index].id,
                  version_id: versions[index].id,
                  version: versions[index].version,
                  revision: feedbackRevision,
                  state: deprecated.includes(versions[index].id)
                    ? 'resolved'
                    : states[index],
                  archived: index === 3,
                },
                unread_count: 0,
              })),
              next_cursor:
                !url.searchParams.has('cursor') || repeatCursor
                  ? 'older-page'
                  : null,
            })
          }
        ),
      ],
    },
  },
}
export default meta
type Story = StoryObj<typeof meta>

function feedbackRoleStory(admin: boolean, owner: boolean): Story {
  return {
    beforeEach: () => {
      isAdmin = admin
      memberRole = owner ? 'owner' : 'member'
      acceptReply = true
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await waitFor(() =>
        expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
      )
      expect(requests).toHaveLength(2)
      const inboxPath = owner
        ? '/users/me/node-version-feedback'
        : '/admin/node-version-feedback'
      expect(requests.every((url) => url.pathname === inboxPath)).toBe(true)
      const supersede = canvas.queryByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
      if (owner) expect(supersede).toBeInTheDocument()
      else expect(supersede).toBeNull()
      await userEvent.click((await canvas.findAllByText('More'))[0])
      await userEvent.click(
        await canvas.findByRole('button', { name: /Private feedback/ })
      )
      const input = await canvas.findByLabelText(
        owner
          ? 'Private reply to the Registry team'
          : 'Private feedback to the author'
      )
      const threadPath = `${owner ? '/publishers/example-publisher' : '/admin'}/nodes/example/versions/${versionId}/feedback`
      expect(threadRequests.map((url) => url.pathname)).toEqual([threadPath])
      const resolve = canvas.queryByRole('button', {
        name: 'Resolve conversation',
      })
      if (owner) expect(resolve).toBeNull()
      else expect(resolve).toBeInTheDocument()
      await userEvent.type(input, 'Reply from the selected role.')
      publisherStatus = 500
      await client.refetchQueries({
        queryKey: [
          PRIVATE_REGISTRY_KEY,
          'firebase-user-123',
          'feedback-publisher',
        ],
      })
      expect(input).toBeInTheDocument()
      expect(input).toHaveValue('Reply from the selected role.')
      expect(messageRequests).toHaveLength(0)
      publisherStatus = 200
      await userEvent.click(
        canvas.getByRole('button', {
          name: owner ? 'Send reply' : 'Send feedback',
        })
      )
      await waitFor(() => expect(input).toHaveValue(''))
      expect(messageRequests.map((url) => url.pathname)).toEqual([
        `${threadPath}/messages`,
      ])
      expect(requests.every((url) => url.pathname === inboxPath)).toBe(true)
    },
  }
}
export const OwnerRepliesAsAuthor = feedbackRoleStory(false, true)
export const AdminOwnerRepliesAsAuthor = feedbackRoleStory(true, true)
export const AdminMemberUsesAdminScope = feedbackRoleStory(true, false)

export const OwnershipMustLoadBeforeFeedback: Story = {
  beforeEach: () => {
    isAdmin = true
    holdPublisher = true
    publisherStatus = 500
    versionsReady = new Promise<void>((resolve) => {
      releaseVersions = resolve
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() => expect(typeof releasePublisher).toBe('function'))
    releaseVersions!()
    await userEvent.click((await canvas.findAllByText('More'))[0])
    expect(
      canvas.queryByRole('button', { name: /Private feedback/ })
    ).toBeNull()
    expect(requests).toHaveLength(0)
    releasePublisher!()
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(
      canvas.queryByRole('button', { name: /Private feedback/ })
    ).toBeNull()
    expect(requests).toHaveLength(0)
    holdPublisher = false
    publisherStatus = 200
    await client.refetchQueries({ queryKey: [PRIVATE_REGISTRY_KEY] })
    await userEvent.click(
      await canvas.findByRole('button', { name: /Private feedback/ })
    )
    await canvas.findByLabelText('Private reply to the Registry team')
    expect(
      threadRequests.every((url) => url.pathname.startsWith('/publishers/'))
    ).toBe(true)
    await userEvent.type(
      canvas.getByLabelText('Private reply to the Registry team'),
      'Discard this draft when access is denied.'
    )
    publisherStatus = 403
    await client.refetchQueries({
      queryKey: [
        PRIVATE_REGISTRY_KEY,
        'firebase-user-123',
        'feedback-publisher',
      ],
    })
    await waitFor(() =>
      expect(
        canvas.queryByLabelText('Private reply to the Registry team')
      ).toBeNull()
    )
    await waitFor(() =>
      expect(
        client.getQueryCache().findAll({
          queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author'],
          predicate: (query) => query.state.data !== undefined,
        })
      ).toHaveLength(0)
    )
  },
}
export const UnresolvedVersions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Version history' })
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
    )
    for (const version of ['1.0.0', '0.8.0']) {
      const row = canvas.getByRole('heading', {
        name: new RegExp(`^Version ${version}`),
      }).parentElement!
      expect(within(row).getByText('Unresolved feedback')).toBeInTheDocument()
    }
    for (const version of ['0.9.0', '0.7.0', '0.6.0']) {
      const row = canvas.getByRole('heading', {
        name: `Version ${version}`,
      }).parentElement!
      expect(within(row).queryByText('Unresolved feedback')).toBeNull()
    }
    expect(requests).toHaveLength(2)
    expect(
      requests.every((url) => url.searchParams.get('nodeId') === 'example')
    ).toBe(true)
    expect(requests[1].searchParams.get('cursor')).toBe('older-page')
    const inbox = {
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author', 'inbox'],
    }
    resolved = true
    await client.refetchQueries(inbox)
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(1)
    )
    inboxError = 401
    await client.refetchQueries(inbox)
    await waitFor(() =>
      expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    )
  },
}
export const RepeatedInboxCursorStopsAndRecovers: Story = {
  beforeEach: () => {
    repeatCursor = true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Version history' })
    const inbox = {
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author', 'inbox'],
    }
    await waitFor(() =>
      expect(client.getQueryCache().findAll(inbox)[0]?.state.status).toBe(
        'error'
      )
    )
    expect(requests.map((url) => url.searchParams.get('cursor'))).toEqual([
      null,
      'older-page',
    ])
    expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    // A later valid response still loads every page and restores the badges.
    repeatCursor = false
    requests = []
    await client.refetchQueries(inbox)
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
    )
    expect(requests).toHaveLength(2)
  },
}

export const PublicVersionHistory: Story = {
  beforeEach: () => {
    canEdit = false
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Version 1.0.0' })
    await waitFor(() => expect(client.isFetching()).toBe(0))
    expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    expect(requests).toHaveLength(0)
    expect(
      canvas.queryByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    ).toBeNull()
  },
}

export const ThreadDenialClearsVersionBadges: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
    )
    await userEvent.click(canvas.getAllByText('More')[0])
    await userEvent.click(
      await canvas.findByRole('button', { name: /Private feedback/ })
    )
    const input = await canvas.findByLabelText(
      'Private reply to the Registry team'
    )
    await userEvent.type(input, 'Private draft before ownership was revoked.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    await canvas.findByText(
      'Feedback is unavailable or you no longer have access.'
    )
    await waitFor(() =>
      expect(canvas.queryAllByText('Unresolved feedback')).toHaveLength(0)
    )
    expect(
      client
        .getQueryCache()
        .findAll({
          queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author'],
        })
        .every((query) => query.state.data === undefined)
    ).toBe(true)
    expect(requests).toHaveLength(2) // Hide immediately; do not wait for another inbox poll.
  },
}

export const NavigateAfterAccessLoss: Story = {
  render: () => <NavigableAuthorPage />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
    )
    inboxError = 401
    await client.refetchQueries({
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author', 'inbox'],
    })
    await waitFor(() =>
      expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    )
    inboxError = null
    await userEvent.click(canvas.getByRole('button', { name: 'Next nodepack' }))
    await canvas.findByRole('heading', { name: 'Another Nodepack' })
    await waitFor(() =>
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(2)
    )
    expect(
      requests.filter((url) => url.searchParams.get('nodeId') === 'another')
    ).toHaveLength(2)
  },
}

export const SupersedeEarlierFeedback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = await canvas.findByRole('button', {
      name: 'Deprecate and close earlier feedback',
    })
    // Ownership loads after the initial public query, adding the Banned filter.
    const displayed = new URL(versionRequests.at(-1)!.url)
    const previousRequests = versionRequests.length
    await userEvent.click(trigger)
    const dialog = within(await within(document.body).findByRole('dialog'))
    expect(dialog.getByText('0.9.0')).toBeInTheDocument()
    expect(dialog.getByText('0.8.0')).toBeInTheDocument()
    expect(dialog.queryByText('0.7.0')).toBeNull() // Archived.
    expect(dialog.queryByText('0.6.0')).toBeNull() // No conversation.
    expect(dialog.getByText(/Replacement: 1.0.0/)).toBeInTheDocument()
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }))
    expect(supersedeCalls).toHaveLength(0)
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await waitFor(() =>
      expect(canvas.getAllByText('Deprecated')).toHaveLength(2)
    )
    expect(supersedeCalls).toHaveLength(1)
    expect(supersedeCalls[0].url).toContain(
      `/versions/${versionId}/feedback/supersede`
    )
    expect(supersedeCalls[0].body.versions).toEqual(
      [1, 2].map((index) => ({
        version_id: versions[index].id,
        target: { publisher_id: publisher.id, thread_id: versions[index].id },
        expected_revision: feedbackFixture().thread!.revision,
      }))
    )
    // Public deprecation and private summaries refresh separately. Wait for
    // confirmation to finish before checking the final available actions.
    await waitFor(() => {
      expect(within(document.body).queryByRole('dialog')).toBeNull()
      expect(
        canvas.queryByRole('button', {
          name: 'Deprecate and close earlier feedback',
        })
      ).toBeNull()
      expect(canvas.getAllByText('Unresolved feedback')).toHaveLength(1)
    })
    expect(displayed.searchParams.getAll('statuses')).toContain(
      'NodeVersionStatusFlagged'
    )
    // React Query invalidation alone cannot refresh this HTTP-cached URL.
    const refreshed = versionRequests.filter(
      (request) =>
        request.url === displayed.href &&
        request.headers.get('Cache-Control')?.includes('no-cache')
    )
    expect(refreshed).toHaveLength(1)
    expect(
      versionRequests
        .slice(previousRequests)
        .every((request) => request.url === displayed.href)
    ).toBe(true)
  },
}
export const SupersedeConflictRequiresReview: Story = {
  beforeEach: () => {
    supersedeStatus = 409
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await canvas.findByText(
      'Feedback changed. Review the refreshed selection before trying again.'
    )
    expect(within(document.body).queryByRole('dialog')).toBeNull()
    expect(supersedeCalls).toHaveLength(1)
    supersedeStatus = 204
    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    expect(supersedeCalls).toHaveLength(1)
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await waitFor(() =>
      expect(canvas.getAllByText('Deprecated')).toHaveLength(2)
    )
  },
}
export const SupersedeAccessLossClearsPrivateUI: Story = {
  beforeEach: () => {
    supersedeStatus = 404
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await waitFor(() =>
      expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    )
    expect(within(document.body).queryByRole('dialog')).toBeNull()
    expect(
      canvas.queryByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    ).toBeNull()
    expect(supersedeCalls).toHaveLength(1)
  },
}

export const SupersedeRetryKeepsSelection: Story = {
  beforeEach: () => {
    supersedeStatus = 500
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await within(document.body).findByText(
      'The request failed. Try again to finish the same selection.'
    )
    expect(supersedeCalls).toHaveLength(1)
    const reviewed = structuredClone(supersedeCalls[0])
    // A newer upload makes 1.0.0 eligible too, and replies advance the old revisions.
    // Polling must not change either the replacement URL or the reviewed request body.
    uploadedVersion = {
      ...versions[0],
      id: '77777777-7777-4777-8777-777777777777',
      version: '1.0.1',
      createdAt: '2026-09-30T09:00:00Z',
    }
    feedbackRevision = 2
    const inbox = {
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author', 'inbox'],
    }
    await Promise.all([
      client.refetchQueries({ queryKey: ['/nodes/example/versions'] }),
      client.refetchQueries(inbox),
    ])
    await canvas.findByRole('heading', { name: 'Version 1.0.1', hidden: true })
    const summaries = client.getQueriesData<{
      threads: { thread: { revision: number } }[]
    }>(inbox)
    expect(summaries).toHaveLength(1)
    expect(
      summaries[0][1]?.threads.map(({ thread }) => thread.revision)
    ).toEqual([2, 2, 2, 2])
    const dialog = within(within(document.body).getByRole('dialog'))
    expect(dialog.getByText('Replacement: 1.0.0')).toBeInTheDocument()
    expect(dialog.queryByText('1.0.0', { exact: true })).toBeNull()
    expect(dialog.getByText('0.9.0')).toBeInTheDocument()
    expect(dialog.getByText('0.8.0')).toBeInTheDocument()
    supersedeStatus = 409 // The original revision is now stale; the owner must review again.
    await userEvent.click(
      within(document.body).getByRole('button', { name: 'Deprecate and close' })
    )
    await canvas.findByText(
      'Feedback changed. Review the refreshed selection before trying again.'
    )
    expect(supersedeCalls).toHaveLength(2)
    expect(supersedeCalls[1]).toEqual(reviewed)
    expect(within(document.body).queryByRole('dialog')).toBeNull()
    expect(canvas.queryByText('Deprecated')).toBeNull()
  },
}

export const SupersedeSelectionSurvivesInboxOutage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Deprecate and close earlier feedback',
      })
    )
    const body = within(document.body)
    expect(
      within(body.getByRole('dialog')).getByText('0.9.0')
    ).toBeInTheDocument()
    inboxError = 500
    const inbox = {
      queryKey: [PRIVATE_REGISTRY_KEY, 'firebase-user-123', 'author', 'inbox'],
    }
    await client.refetchQueries(inbox)
    await waitFor(() =>
      expect(canvas.queryByText('Unresolved feedback')).toBeNull()
    )
    expect(body.getByRole('dialog')).toBeInTheDocument()
    expect(
      within(body.getByRole('dialog')).getByText('0.8.0')
    ).toBeInTheDocument()
    expect(supersedeCalls).toHaveLength(0)
    inboxError = null
    await client.refetchQueries(inbox)
    await userEvent.click(
      body.getByRole('button', { name: 'Deprecate and close' })
    )
    await waitFor(() =>
      expect(canvas.getAllByText('Deprecated')).toHaveLength(2)
    )
    expect(supersedeCalls).toHaveLength(1)
    expect(supersedeCalls[0].body.versions.map((v) => v.version_id)).toEqual([
      versions[1].id,
      versions[2].id,
    ])
  },
}
