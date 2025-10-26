import { Meta, StoryObj } from '@storybook/nextjs-vite'
import RegistryStory from '@/src/stories/RegistryStory'

const meta = {
  title: 'Pages/Registry',
  component: RegistryStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="bg-gray-900 min-h-screen">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RegistryStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
