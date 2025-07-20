import { Meta, StoryObj } from '@storybook/nextjs-vite'
import Logout from '@/components/AuthUI/Logout'
import { handlers } from '@/src/mocks/handlers'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'
import { useSignOut } from 'react-firebase-hooks/auth'
import { fn } from '@storybook/test'
import { User as FirebaseUser } from 'firebase/auth'

/**
 * Logout Page Story - represents the /auth/logout page
 * This shows the logout functionality as a standalone page
 */
const LogoutPageStory = () => {
    return <Logout />
}

const meta: Meta<typeof LogoutPageStory> = {
    title: 'Pages/Auth/Logout',
    component: LogoutPageStory,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
        docs: {
            description: {
                component:
                    'The logout page that provides users with a way to log out of their account. Shows a simple logout button with loading and error states.',
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
type Story = StoryObj<typeof LogoutPageStory>

// Mock Firebase user data
const mockFirebaseUser = {
    uid: 'firebase-user-123',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    photoURL: 'https://picsum.photos/40/40',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => undefined,
    getIdToken: async () => '',
    getIdTokenResult: async () => ({}) as any,
    reload: async () => undefined,
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'google',
} satisfies FirebaseUser

export const Default: Story = {
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
        
        // Mock Firebase auth hooks
        useSignOut.mockReturnValue([fn(), false, undefined])
    },
}
