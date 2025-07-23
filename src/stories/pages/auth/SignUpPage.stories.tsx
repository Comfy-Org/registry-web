import { Meta, StoryObj } from '@storybook/nextjs-vite'
import AuthUI from '@/components/AuthUI/AuthUI'
import { handlers } from '@/src/mocks/handlers'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'

/**
 * Sign Up Page Story - represents the /auth/signup page
 * Note: In the actual app, signup uses the same AuthUI component as signin
 */
const SignUpPageStory = () => {
    return <AuthUI />
}

const meta: Meta<typeof SignUpPageStory> = {
    title: 'Pages/Auth/SignUp',
    component: SignUpPageStory,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
        docs: {
            description: {
                component:
                    'The sign-up page that users see when navigating to /auth/signup. In the actual application, this uses the same AuthUI component as the sign-in page, as both Google and GitHub handle the signup/signin flow automatically.',
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
type Story = StoryObj<typeof SignUpPageStory>

export const Default: Story = {
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
