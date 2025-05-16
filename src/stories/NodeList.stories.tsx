import { Meta, StoryObj } from '@storybook/react';
import RegistryStory from './RegistryStory';

/**
 * Since the actual NodeList component from pages/index.tsx just renders the Registry component
 * that has external dependencies, we'll create a simplified version for Storybook
 */
const NodeListStory = () => <RegistryStory />;

const meta = {
  title: 'Pages/NodeList',
  component: NodeListStory,
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
} satisfies Meta<typeof NodeListStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
