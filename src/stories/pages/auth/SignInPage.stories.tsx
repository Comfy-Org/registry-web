import { Meta, StoryObj } from '@storybook/nextjs-vite'
import AuthUIStory from '../../components/auth/AuthUIStory'

/**
 * Sign In Page Story - represents the /auth/login page
 * This shows how the sign-in component appears as a full page
 */
const SignInPageStory = () => {
    return <AuthUIStory />
}

const meta: Meta<typeof SignInPageStory> = {
    title: 'Pages/Auth/SignIn',
    component: SignInPageStory,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The sign-in page that users see when navigating to /auth/login. Uses the AuthUI component to provide Google and GitHub authentication options.',
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SignInPageStory>

export const Default: Story = {
    args: {},
}
