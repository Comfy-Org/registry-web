import type { Meta, StoryObj } from '@storybook/react'
import ProfileDropdown from '../../../../components/Header/ProfileDropdown'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

const meta = {
    title: 'Components/Header/ProfileDropdown',
    component: ProfileDropdown,
    parameters: {
        layout: 'centered',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#1f2937' },
                { name: 'light', value: '#ffffff' },
            ],
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <QueryClientProvider client={queryClient}>
                <div className="p-4">
                    <Story />
                </div>
            </QueryClientProvider>
        ),
    ],
} satisfies Meta<typeof ProfileDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    parameters: {
        mockData: [
            {
                url: '/api/user',
                method: 'GET',
                status: 200,
                response: {
                    id: '1',
                    email: 'user@example.com',
                    displayName: 'John Doe',
                    isAdmin: false,
                },
            },
        ],
    },
}

export const AdminUser: Story = {
    parameters: {
        mockData: [
            {
                url: '/api/user',
                method: 'GET',
                status: 200,
                response: {
                    id: '1',
                    email: 'admin@example.com',
                    displayName: 'Admin User',
                    isAdmin: true,
                },
            },
        ],
    },
}