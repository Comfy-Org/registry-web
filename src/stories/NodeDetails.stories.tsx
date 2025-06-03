import { Meta, StoryObj } from '@storybook/react'
import NodeDetailsStory from './NodeDetailsStory'

const meta = {
    title: 'Pages/NodeDetails',
    component: NodeDetailsStory,
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
} satisfies Meta<typeof NodeDetailsStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {},
}

export const Loading: Story = {
    args: {
        isLoading: true,
    },
}

export const AdminView: Story = {
    args: {
        isAdmin: true,
    },
}

export const AdminViewNoPreemptedNames: Story = {
    args: {
        isAdmin: true,
        showPreemptedNames: false,
    },
}
