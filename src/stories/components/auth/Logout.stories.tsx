import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from '@storybook/test'
import LogoutStory from './LogoutStory'

const meta: Meta<typeof LogoutStory> = {
    title: 'Auth/Logout',
    component: LogoutStory,
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
    argTypes: {
        isLoading: {
            control: 'boolean',
            description: 'Whether the logout process is loading',
        },
        error: {
            control: 'text',
            description: 'Error message to display',
        },
        showSuccessMessage: {
            control: 'boolean',
            description: 'Whether to show success message',
        },
        onLogout: {
            action: 'logout',
            description: 'Callback for logout action',
        },
    },
}

export default meta
type Story = StoryObj<typeof LogoutStory>

export const Default: Story = {
    args: {
        isLoading: false,
        error: undefined,
        showSuccessMessage: false,
        onLogout: fn(),
    },
}

export const Loading: Story = {
    args: {
        ...Default.args,
        isLoading: true,
    },
}

export const WithError: Story = {
    args: {
        ...Default.args,
        error: 'Failed to logout. Please try again.',
    },
}

export const Success: Story = {
    args: {
        ...Default.args,
        showSuccessMessage: true,
    },
}