import ProfileDropdown from '@/components/Header/ProfileDropdown'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { handlers } from '@/src/mocks/handlers'
import { CAPI } from '@/src/mocks/apibase'
import { http, HttpResponse } from 'msw'
import { User } from '@/src/api/generated'
import {
    useFirebaseUser,
    mockFirebaseUser,
} from '@/src/hooks/useFirebaseUser.mock'

const meta = {
    title: 'Components/Header/ProfileDropdown',
    component: ProfileDropdown,
    parameters: {
        layout: 'centered',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
    },
} satisfies Meta<typeof ProfileDropdown>

export default meta

type Story = StoryObj<typeof meta>

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

export const RegularUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(regularUser)),
                ...handlers,
            ],
        },
    },
    async beforeEach() {
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
    async beforeEach() {
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
    async beforeEach() {
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
    async beforeEach() {
        // Mock Firebase user as logged out
        useFirebaseUser.mockReturnValue([null, false, undefined])
    },
}
