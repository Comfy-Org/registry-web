import { Meta, StoryObj } from '@storybook/nextjs-vite'
import AuthUI from '@/components/AuthUI/AuthUI'
import { handlers } from '@/src/mocks/handlers'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'

/**
 * Sign In Page Story - represents the /auth/login page
 * This shows how the sign-in component appears as a full page
 */
const SignInPageStory = () => {
    return <AuthUI />
}

const meta: Meta<typeof SignInPageStory> = {
    title: 'Pages/Auth/SignIn',
    component: SignInPageStory,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
        docs: {
            description: {
                component:
                    'The sign-in page that users see when navigating to /auth/login. Uses the AuthUI component to provide Google and GitHub authentication options.',
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div className="bg-gray-900 min-h-screen">
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof SignInPageStory>

export const Default: Story = {
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
