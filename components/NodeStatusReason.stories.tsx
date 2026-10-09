import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { http, HttpResponse } from 'msw'
import { expect, userEvent, within } from 'storybook/test'
import type { NodeVersion } from '@/src/api/feedback.generated'
import { NodeStatusReason } from './NodeStatusReason'

const scan = JSON.stringify([
  {
    issue_type: 'Installation command',
    file_path: 'install.py',
    line_number: 1,
    code_snippet: 'pip install dependency',
  },
])
// The current version and its previous approval can both be outside page one.
const versions: NodeVersion[] = Array.from({ length: 102 }, (_, i) => ({
  id: `version-${i}`,
  node_id: 'example',
  version: `1.${i}.0`,
  createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(),
  status: i === 0 ? 'NodeVersionStatusActive' : 'NodeVersionStatusFlagged',
  status_reason:
    i === 0
      ? JSON.stringify({
          message: 'Reviewed and approved',
          by: 'admin@example.invalid',
          statusHistory: [
            { status: 'NodeVersionStatusFlagged', message: scan },
          ],
        })
      : scan,
}))
let requests: URL[] = []
const meta: Meta<typeof NodeStatusReason> = {
  title: 'Feedback/Admin scan history',
  component: NodeStatusReason,
  args: versions.at(-1),
  beforeEach: () => {
    requests = []
  },
  parameters: {
    msw: {
      handlers: [
        http.get('*/nodes/example', () =>
          HttpResponse.json({
            id: 'example',
            repository: 'https://example.invalid/repo',
          })
        ),
        http.get('*/admin/nodeversions', ({ request }) => {
          const url = new URL(request.url)
          requests.push(url)
          const page = Number(url.searchParams.get('page') ?? 1)
          const pageSize = Number(url.searchParams.get('pageSize'))
          return HttpResponse.json({
            versions: [...versions]
              .reverse()
              .slice((page - 1) * pageSize, page * pageSize),
            page,
            pageSize,
            total: versions.length,
            totalPages: Math.ceil(versions.length / pageSize),
          })
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText(/✅/)
    expect(requests.map((url) => url.searchParams.get('page'))).toEqual([
      '1',
      '2',
    ])
    for (const { searchParams } of requests) {
      expect(searchParams.get('nodeId')).toBe('example')
      expect(searchParams.get('include_status_reason')).toBe('true')
      expect(searchParams.get('include_deleted')).toBe('true')
    }
    await userEvent.click(canvas.getByText('Node history:'))
    // Every older version remains reachable through the existing history UI.
    for (let i = 0; i < 10; i++) {
      await userEvent.click(
        canvas.getByRole('button', { name: /Show more versions/ })
      )
    }
    expect(canvas.getByText('1.0.0', { exact: false })).toBeVisible()
    expect(
      canvas.queryByRole('button', { name: /Show more versions/ })
    ).toBeNull()
  },
}
export default meta
type Story = StoryObj<typeof meta>

export const LatestVersion: Story = {}
export const OlderVersion: Story = { args: versions[1] }
