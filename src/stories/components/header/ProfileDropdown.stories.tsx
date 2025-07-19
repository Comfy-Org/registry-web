import ProfileDropdown from '@/components/Header/ProfileDropdown'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CAPI, handlers } from '@/src/mocks/handlers'
import { http, HttpResponse } from 'msw'
import { User } from '@/src/api/generated'

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
    tags: ['autodocs'],
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

export const RegularUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json(regularUser)),
                ...handlers,
            ],
        },
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
}

export const UnapprovedUser: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/users'), () => HttpResponse.json({
                    ...regularUser,
                    isApproved: false,
                })),
                ...handlers,
            ],
        },
    },
}
