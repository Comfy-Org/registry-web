import { Meta, StoryObj } from '@storybook/nextjs-vite'
import LogoutStory from '../../components/auth/LogoutStory'

/**
 * Logout Page Story - represents the /auth/logout page
 * This shows the logout functionality as a standalone page
 */
const LogoutPageStory = () => {
    return <LogoutStory />
}

const meta: Meta<typeof LogoutPageStory> = {
    title: 'Pages/Auth/Logout',
    component: LogoutPageStory,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The logout page that provides users with a way to log out of their account. Shows a simple logout button with loading and error states.',
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof LogoutPageStory>

export const Default: Story = {
    args: {},
}
