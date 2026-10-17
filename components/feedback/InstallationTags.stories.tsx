import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'
import { InstallationTags } from './InstallationTags'
const meta: Meta<typeof InstallationTags> = {
  title: 'Feedback/Public installation tags',
  component: InstallationTags,
  args: { tags: ['any-code-execute', 'any-network-requests'] },
  decorators: [
    (Story) => (
      <div className="max-w-2xl p-6 text-white">
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>
export const Public: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('region', { name: 'Public installation tags' })
    ).toBeVisible()
    await expect(canvas.getByText('any-code-execute')).toBeVisible()
    await expect(canvas.getByText('any-network-requests')).toBeVisible()
    await expect(canvas.queryByText('No installation tags')).toBeNull()
  },
}
export const Empty: Story = {
  args: { tags: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('No installation tags')).toBeVisible()
    await expect(canvas.queryByText('any-code-execute')).toBeNull()
  },
}
