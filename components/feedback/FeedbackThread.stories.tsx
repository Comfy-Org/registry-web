import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within, waitFor } from 'storybook/test'
import { FeedbackThread } from './FeedbackThread'
import { http, HttpResponse } from 'msw'

import { QueryClient, useQueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { z } from 'zod'
import { PRIVATE_REGISTRY_KEY } from '@/src/api/privateRegistry'
import { versionId, feedbackFixture } from './feedback.fixtures'
import { feedbackHandlers, type FeedbackRequests } from './feedback.mocks'

const requests: FeedbackRequests = { messages: [], states: [] }
const mocks = {
  author: feedbackHandlers(false, 'open', requests),
  admin: feedbackHandlers(true, 'open', requests),
  emptyAuthor: feedbackHandlers(false, 'empty'),
  emptyAdmin: feedbackHandlers(true, 'empty', requests),
  resolved: feedbackHandlers(false, 'resolved'),
  forbidden: feedbackHandlers(false, 'forbidden'),
  failedReply: feedbackHandlers(false, 'failure', requests),
  revokedReply: feedbackHandlers(false, 'revoked-on-send', requests),
  revokedHistory: feedbackHandlers(false, 'revoked-on-history'),
}
let queryClient: QueryClient
function CaptureQueryClient({ children }: { children: ReactNode }) {
  queryClient = useQueryClient()
  return <>{children}</>
}
async function expectPrivateCachesCleared() {
  await waitFor(() => {
    const queries = queryClient
      .getQueryCache()
      .findAll({ queryKey: [PRIVATE_REGISTRY_KEY] })
    expect(queries.every((query) => query.state.data === undefined)).toBe(true)
    expect(
      queryClient
        .getMutationCache()
        .findAll({ mutationKey: [PRIVATE_REGISTRY_KEY] })
    ).toEqual([])
  })
}

const meta: Meta<typeof FeedbackThread> = {
  title: 'Feedback/Thread',
  component: FeedbackThread,
  args: {
    nodeId: 'example',
    versionId,
    publisherId: 'example-publisher',
    role: 'author',
  },
  decorators: [
    (Story) => (
      <CaptureQueryClient>
        <div className="mx-auto max-w-3xl p-6 text-white">
          <Story />
        </div>
      </CaptureQueryClient>
    ),
  ],
  beforeEach: () => {
    Object.values(mocks).forEach((mock) => mock.reset())
    requests.messages.length = 0
    requests.states.length = 0
  },
  parameters: {
    layout: 'fullscreen',
    msw: { handlers: mocks.author.handlers },
  },
}
export default meta
type Story = StoryObj<typeof meta>
export const Author: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText(
      'Private reply to the Registry team'
    )
    await expect(
      canvas.getByRole('button', { name: 'Send reply' })
    ).toBeDisabled()
    await userEvent.type(input, 'Fixed <script>alert(1)</script>')
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    await expect(
      await within(canvas.getByLabelText('Feedback messages')).findByText(
        'Fixed <script>alert(1)</script>'
      )
    ).toBeVisible()
    await expect(canvasElement.querySelector('script')).toBeNull()
    const latest = canvas.getByText('Latest feedback').closest('article')!
    expect(latest).toHaveTextContent('Fixed <script>alert(1)</script>')
    expect(within(latest).getByText('You')).toBeInTheDocument()
    await expect(requests.messages).toHaveLength(1)
    await expect(requests.messages[0]).toEqual({
      target: feedbackFixture().target,
      body: 'Fixed <script>alert(1)</script>',
      client_message_id: expect.any(String),
    })
    await expect(
      z.string().uuid().safeParse(requests.messages[0].client_message_id)
        .success
    ).toBe(true)
  },
}

function markdownStory(role: 'admin' | 'author'): Story {
  const mock = feedbackHandlers(role === 'admin')
  const data = feedbackFixture(role === 'admin')
  data.messages[0].sender_user_id = 'other-person'
  data.messages[0].sender_role = role === 'admin' ? 'author' : 'admin'
  data.messages[0].sender_name =
    '<img src="/feedback-name-probe" onerror="document.documentElement.dataset.feedbackXss=1">'
  data.messages[0].body = [
    '## Installation review',
    '**Remove the script** and *pin dependencies*.',
    '- Verify offline installation\n- Share the tested nodepack version',
    '> Keep the verification steps in the README.',
    '```sh\npython -m pip check\n```',
    'See the [nodepack version 1.0.1](https://example.invalid/nodes/example/versions/1.0.1).',
    '<script>document.documentElement.dataset.feedbackXss=1</script>',
    '<img src="/feedback-body-probe" onerror="document.documentElement.dataset.feedbackXss=1">',
    '<svg onload="document.documentElement.dataset.feedbackXss=1"></svg>',
    '[script URL](javascript:alert%281%29) [encoded URL](jav&#x61;script:alert%281%29) [data URL](data:text/html,test) [VBScript URL](vbscript:msgbox%281%29)',
    '![Verification image](https://example.invalid/private-feedback-tracker)',
  ].join('\n\n')
  data.messages.push({
    ...data.messages[0],
    id: '33333333-3333-4333-8333-333333333333',
    seq: 2,
    sender_user_id: 'firebase-user-123',
    sender_name: 'Current user',
    sender_role: role,
    body: '**Follow-up** with the verification details.',
  })
  data.thread!.last_message_seq = 2
  return {
    args: { role },
    beforeEach: mock.reset,
    parameters: {
      msw: {
        handlers: [
          http.get(/\/feedback$/, () => HttpResponse.json(data)),
          ...mock.handlers,
        ],
      },
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement)
      await canvas.findByRole('heading', {
        name: 'Installation review',
        level: 2,
      })
      expect(canvas.getByText('Remove the script').tagName).toBe('STRONG')
      expect(canvas.getByText('pin dependencies').tagName).toBe('EM')
      expect(canvas.getAllByRole('listitem')).toHaveLength(2)
      expect(canvas.getByText('python -m pip check').tagName).toBe('CODE')
      expect(
        canvas
          .getByText('Keep the verification steps in the README.')
          .closest('blockquote')
      ).not.toBeNull()
      const link = canvas.getByRole('link', { name: 'nodepack version 1.0.1' })
      expect(link).toHaveAttribute(
        'href',
        'https://example.invalid/nodes/example/versions/1.0.1'
      )
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      const message = canvasElement.querySelector('article')!
      for (const name of [
        'script URL',
        'encoded URL',
        'data URL',
        'VBScript URL',
      ]) {
        expect(message).toHaveTextContent(name)
        expect(canvas.queryByRole('link', { name })).toBeNull()
      }
      expect(canvas.getByText(data.messages[0].sender_name)).toBeInTheDocument()
      expect(canvas.getByText('Verification image')).toBeInTheDocument()
      expect(message.querySelector('script,img,svg,iframe,object')).toBeNull()
      expect(canvasElement.ownerDocument.documentElement).not.toHaveAttribute(
        'data-feedback-xss'
      )
      expect(within(message).queryByText('You')).toBeNull()
      expect(within(message).queryByText('Latest feedback')).toBeNull()
      const latest = canvas.getByText('Latest feedback').closest('article')!
      expect(latest).toHaveTextContent('Follow-up')
      expect(within(latest).getByText('You')).toBeInTheDocument()
      // Check rendered emphasis, not just labels or the presence of CSS classes.
      const ownStyle = getComputedStyle(latest)
      const otherStyle = getComputedStyle(message)
      expect(ownStyle.backgroundColor).not.toBe(otherStyle.backgroundColor)
      expect(parseFloat(ownStyle.marginLeft)).toBeGreaterThan(
        parseFloat(otherStyle.marginLeft)
      )
      expect(ownStyle.boxShadow).not.toBe('none')
      expect(ownStyle.boxShadow).not.toBe(otherStyle.boxShadow)
    },
  }
}
export const MarkdownAuthor: Story = markdownStory('author')
export const MarkdownAdmin: Story = markdownStory('admin')

export const LiveMarkdownPreview: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText(
      'Private reply to the Registry team'
    )
    expect(canvas.queryByRole('region', { name: 'Message preview' })).toBeNull()
    await userEvent.type(input, '**Updated** `pip check`')
    const previewElement = await canvas.findByRole('region', {
      name: 'Message preview',
    })
    const preview = within(previewElement)
    expect(preview.getByText('Updated').tagName).toBe('STRONG')
    expect(preview.getByText('pip check').tagName).toBe('CODE')
    await userEvent.type(
      input,
      '\n\n<img src="/preview-probe" onerror="alert(1)">\n\n[unsafe](javascript:alert%281%29)'
    )
    expect(previewElement.querySelector('img,script')).toBeNull()
    expect(preview.queryByRole('link', { name: 'unsafe' })).toBeNull()
    expect(requests.messages).toHaveLength(0)
    await userEvent.clear(input)
    expect(canvas.queryByRole('region', { name: 'Message preview' })).toBeNull()
    await userEvent.type(input, '**Verified** offline installation.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    await waitFor(() =>
      expect(
        canvas.queryByRole('region', { name: 'Message preview' })
      ).toBeNull()
    )
    expect(canvas.getByText('Verified').tagName).toBe('STRONG')
    expect(requests.messages).toHaveLength(1)
    expect(requests.messages[0].body).toBe('**Verified** offline installation.')
  },
}

export const Admin: Story = {
  args: { role: 'admin' },
  parameters: { msw: { handlers: mocks.admin.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const versionsKey = [
      PRIVATE_REGISTRY_KEY,
      'firebase-user-123',
      'admin',
      'admin-versions',
    ]
    const scanKey = [
      PRIVATE_REGISTRY_KEY,
      'firebase-user-123',
      'admin',
      'scan-history',
      'example',
    ]
    queryClient.setQueryData(versionsKey, { versions: [] })
    queryClient.setQueryData(scanKey, { versions: [] })
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Resolve conversation' })
    )
    await expect(
      await canvas.findByText('This conversation is read-only.')
    ).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reopen conversation' })
    )
    await expect(
      await canvas.findByLabelText('Private feedback to the author')
    ).toBeVisible()
    await expect(requests.states).toEqual([
      {
        target: feedbackFixture(true).target,
        state: 'resolved',
        expected_revision: 1,
      },
      {
        target: feedbackFixture(true).target,
        state: 'open',
        expected_revision: 2,
      },
    ])
    await waitFor(() => expect(queryClient.isMutating()).toBe(0))
    expect(queryClient.getQueryState(versionsKey)?.isInvalidated).toBe(false)
    await userEvent.type(
      canvas.getByRole('textbox'),
      'Please also update the installation notes.'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await within(canvas.getByLabelText('Feedback messages')).findByText(
      'Please also update the installation notes.'
    )
    await waitFor(() => expect(queryClient.isMutating()).toBe(0))
    expect(queryClient.getQueryState(versionsKey)?.isInvalidated).toBe(true)
    expect(queryClient.getQueryState(scanKey)?.isInvalidated).toBe(false)
  },
}
export const EmptyAuthor: Story = {
  parameters: { msw: { handlers: mocks.emptyAuthor.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        'No feedback yet. The Registry team can start a conversation on a flagged version.'
      )
    ).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Send reply' })
    ).toBeNull()
  },
}
export const FirstAdminMessage: Story = {
  args: { role: 'admin' },
  parameters: { msw: { handlers: mocks.emptyAdmin.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.type(
      await canvas.findByLabelText('Private feedback to the author'),
      'Please revise installation.'
    )
    await userEvent.click(canvas.getByRole('button', { name: 'Send feedback' }))
    await expect(
      await within(canvas.getByLabelText('Feedback messages')).findByText(
        'Please revise installation.'
      )
    ).toBeInTheDocument()
    await expect(canvas.getByRole('textbox')).toHaveValue('')
    await expect(requests.messages).toHaveLength(1)
    await expect(requests.messages[0].target).toEqual({
      publisher_id: 'example-publisher',
      thread_id: null,
    })
    await expect(
      z.string().uuid().safeParse(requests.messages[0].client_message_id)
        .success
    ).toBe(true)
  },
}
export const Resolved: Story = {
  parameters: { msw: { handlers: mocks.resolved.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('This conversation is read-only.')
    ).toBeVisible()
    await expect(
      canvas.getByText(feedbackFixture().messages[0].body)
    ).toBeVisible()
    await expect(canvas.getByText('Resolved')).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(
      canvas.queryByRole('button', { name: 'Reopen conversation' })
    ).toBeNull()
  },
}
export const RevokedAccess: Story = {
  parameters: { msw: { handlers: mocks.forbidden.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Feedback is unavailable or you no longer have access.'
    )
    await expect(
      canvas.queryByText(feedbackFixture().messages[0].body)
    ).toBeNull()
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}
export const FailedReply: Story = {
  parameters: { msw: { handlers: mocks.failedReply.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText(
      'Private reply to the Registry team'
    )
    await userEvent.type(input, 'Keep this draft.')
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Your draft is preserved'
    )
    await expect(input).toHaveValue('Keep this draft.')
    await expect(requests.messages).toHaveLength(1)
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    await expect(
      await within(canvas.getByLabelText('Feedback messages')).findByText(
        'Keep this draft.'
      )
    ).toBeVisible()
    await expect(requests.messages).toHaveLength(2)
    await expect(requests.messages[1]).toEqual(requests.messages[0])
    await expect(
      z.string().uuid().safeParse(requests.messages[0].client_message_id)
        .success
    ).toBe(true)
    await expect(canvas.getByRole('textbox')).toHaveValue('')
  },
}

export const RevokedDuringReply: Story = {
  parameters: {
    msw: { handlers: mocks.revokedReply.handlers },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = await canvas.findByLabelText(
      'Private reply to the Registry team'
    )
    await userEvent.type(input, 'An update.')
    await expect(
      queryClient.getQueriesData({ queryKey: [PRIVATE_REGISTRY_KEY] })
    ).not.toEqual([])
    await userEvent.click(canvas.getByRole('button', { name: 'Send reply' }))
    // Cache removal remounts the conversation; assert against the current DOM.
    await waitFor(() => {
      expect(
        canvas.getByText(
          'Feedback is unavailable or you no longer have access.'
        )
      ).toBeVisible()
      expect(
        canvas.queryByText(
          'Please revise the installation command and share the replacement nodepack version.'
        )
      ).toBeNull()
      expect(canvas.queryByRole('textbox')).toBeNull()
    })
    await expect(requests.messages[0].body).toBe('An update.')
    await expectPrivateCachesCleared()
  },
}

export const RevokedDuringHistory: Story = {
  parameters: { msw: { handlers: mocks.revokedHistory.handlers } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Load earlier messages' })
    )
    await waitFor(() => {
      expect(
        canvas.getByText(
          'Feedback is unavailable or you no longer have access.'
        )
      ).toBeVisible()
      expect(
        canvas.queryByText(
          'Please revise the installation command and share the replacement nodepack version.'
        )
      ).toBeNull()
      expect(canvas.queryByRole('textbox')).toBeNull()
    })
    await expectPrivateCachesCleared()
  },
}

export const OwnerHandoffToReplacement: Story = {
  args: { role: 'admin' },
  parameters: {
    msw: {
      handlers: [
        http.get('*/admin/nodes/:nodeId/versions/:versionId/feedback', () => {
          const data = feedbackFixture(true)
          data.thread!.state = 'resolved'
          data.permissions = {
            can_start: false,
            can_reply: false,
            can_resolve: false,
            can_reopen: true,
          }
          data.last_read_message_seq = 1
          data.events = [
            {
              id: '66666666-6666-4666-8666-666666666666',
              event_type: 'superseded',
              created_at: '2026-09-30T11:00:00Z',
              replacement_version_id: '77777777-7777-4777-8777-777777777777',
              replacement_version: '1.0.1',
            },
          ]
          return HttpResponse.json(data)
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(
      /Closed by author: replaced by version 1\.0\.1\. No further follow-up on this version\./
    )
    expect(
      canvas.getByRole('link', { name: 'Review replacement version' })
    ).toHaveAttribute(
      'href',
      '/admin/nodeversions?nodeId=example&version=1.0.1'
    )
    expect(canvas.queryByRole('textbox')).toBeNull()
    expect(
      canvas.getByRole('button', { name: 'Reopen conversation' })
    ).toBeEnabled()
  },
}
