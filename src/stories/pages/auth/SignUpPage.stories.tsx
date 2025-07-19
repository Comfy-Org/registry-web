import { Meta, StoryObj } from '@storybook/nextjs-vite'
import AuthUIStory from '../../components/auth/AuthUIStory'

/**
 * Sign Up Page Story - represents the /auth/signup page
 * Note: In the actual app, signup uses the same AuthUI component as signin
 */
const SignUpPageStory = () => {
    return <AuthUIStory />
}

const meta: Meta<typeof SignUpPageStory> = {
    title: 'Pages/Auth/SignUp',
    component: SignUpPageStory,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The sign-up page that users see when navigating to /auth/signup. In the actual application, this uses the same AuthUI component as the sign-in page, as both Google and GitHub handle the signup/signin flow automatically.',
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SignUpPageStory>

export const Default: Story = {
    args: {},
}
