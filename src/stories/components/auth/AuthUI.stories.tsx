import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from '@storybook/test'
import AuthUIStory from './AuthUIStory'

const meta: Meta<typeof AuthUIStory> = {
    title: 'Auth/SignIn',
    component: AuthUIStory,
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
            description: 'Whether the sign-in process is loading',
        },
        error: {
            control: 'text',
            description: 'Error message to display',
        },
        showLoginButton: {
            control: 'boolean',
            description: 'Whether to show the login buttons',
        },
        onGoogleSignIn: {
            action: 'google-signin',
            description: 'Callback for Google sign-in',
        },
        onGithubSignIn: {
            action: 'github-signin',
            description: 'Callback for GitHub sign-in',
        },
    },
}

export default meta
type Story = StoryObj<typeof AuthUIStory>

export const Default: Story = {
    args: {
        isLoading: false,
        error: undefined,
        showLoginButton: true,
        onGoogleSignIn: fn(),
        onGithubSignIn: fn(),
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
        error: 'Account already exists with different credential',
    },
}

export const NetworkError: Story = {
    args: {
        ...Default.args,
        error: 'Network error. Please try again.',
    },
}

export const ButtonsDisabled: Story = {
    args: {
        ...Default.args,
        showLoginButton: false,
    },
}