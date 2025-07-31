import ProfileDropdown from '@/components/Header/ProfileDropdown'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { handlers } from '@/src/mocks/handlers'
import { CAPI } from '@/src/mocks/apibase'
import { http, HttpResponse } from 'msw'
import { User } from '@/src/api/generated'
import { User as FirebaseUser } from 'firebase/auth'
import { useFirebaseUser } from '@/src/hooks/useFirebaseUser.mock'

const meta: Meta<typeof ProfileDropdown> = {
    title: 'Components/Header/ProfileDropdown',
    component: ProfileDropdown,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
    },
}

export default meta

type Story = StoryObj<typeof ProfileDropdown>

// Mock user data variations
const regularUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    isApproved: true,
}

const adminUser: User = {
    id: 'admin-456',
    name: 'Admin User',
    email: 'admin@example.com',
    isAdmin: true,
    isApproved: true,
}

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
} satisfies FirebaseUser // Using 'as any' to avoid having to mock the entire Firebase User interface

export const RegularUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(regularUser)),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as logged in
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const AdminUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(adminUser)),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as admin
        useFirebaseUser.mockReturnValue([
            {
                ...mockFirebaseUser,
                email: 'admin@example.com',
                displayName: 'Admin User',
            },
            false,
            undefined,
        ])
    },
}

export const UnapprovedUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () =>
                    HttpResponse.json({
                        ...regularUser,
                        isApproved: false,
                    })
                ),
                ...handlers,
            ],
        },
    },
    beforeEach: () => {
        // Mock Firebase user as unapproved
        useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
    },
}

export const LoggedOut: Story = {
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
    beforeEach: () => {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
