import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HttpResponse, http } from 'msw'
import AuthUI from '@/components/AuthUI/AuthUI'
import { User } from '@/src/api/generated'
import {
    mockFirebaseUser,
    useFirebaseUser,
} from '@/src/hooks/useFirebaseUser.mock'
import { CAPI } from '@/src/mocks/apibase'
import { handlers } from '@/src/mocks/handlers'

const meta = {
    title: 'Components/AuthUI/SignIn',
    component: AuthUI,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
    },
    decorators: [
        (Story) => (
            <div className="bg-gray-900 min-h-screen">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof AuthUI>

export default meta

type Story = StoryObj<typeof meta>

// Mock user data
const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    isApproved: true,
}

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () =>
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    async beforeEach() {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}

export const Loading: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () =>
                    HttpResponse.json(null, { status: 401 })
                ),
                ...handlers,
            ],
        },
    },
    async beforeEach() {
        // Mock Firebase user as loading
        useFirebaseUser.mockReturnValue([null, true, undefined])
    },
}

export const AlreadyLoggedIn: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(mockUser)),
                ...handlers,
            ],
        },
    },
    async beforeEach() {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}
