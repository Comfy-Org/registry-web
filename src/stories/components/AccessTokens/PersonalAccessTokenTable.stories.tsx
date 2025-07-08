import type { Meta, StoryObj } from '@storybook/react'
import PersonalAccessTokenTable from '../../../../components/AccessTokens/PersonalAccessTokenTable'
import { PersonalAccessToken } from '@/src/api/generated'

const meta = {
    title: 'Components/AccessTokens/PersonalAccessTokenTable',
    component: PersonalAccessTokenTable,
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
    argTypes: {
        accessTokens: {
            control: 'object',
            description: 'Array of personal access tokens',
        },
        handleCreateButtonClick: {
            action: 'create-clicked',
            description: 'Handler for create button click',
        },
        deleteToken: {
            action: 'delete-clicked',
            description: 'Handler for delete token',
        },
        isLoading: {
            control: 'boolean',
            description: 'Loading state',
        },
    },
} satisfies Meta<typeof PersonalAccessTokenTable>

export default meta
type Story = StoryObj<typeof meta>

const mockTokens: PersonalAccessToken[] = [
    {
        id: '1',
        name: 'Development Key',
        token: 'tok_dev_1234567890abcdef',
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Production Key',
        token: 'tok_prod_abcdef1234567890',
        createdAt: '2023-01-15T00:00:00Z',
    },
    {
        id: '3',
        name: 'CI/CD Pipeline',
        token: 'tok_ci_9876543210fedcba',
        createdAt: '2023-02-01T00:00:00Z',
    },
]

export const Default: Story = {
    args: {
        accessTokens: mockTokens,
        isLoading: false,
        handleCreateButtonClick: () => console.log('Create button clicked'),
        deleteToken: (id: string) => console.log('Delete token:', id),
    },
}

export const Loading: Story = {
    args: {
        accessTokens: [],
        isLoading: true,
        handleCreateButtonClick: () => console.log('Create button clicked'),
        deleteToken: (id: string) => console.log('Delete token:', id),
    },
}

export const EmptyState: Story = {
    args: {
        accessTokens: [],
        isLoading: false,
        handleCreateButtonClick: () => console.log('Create button clicked'),
        deleteToken: (id: string) => console.log('Delete token:', id),
    },
}

export const SingleToken: Story = {
    args: {
        accessTokens: [mockTokens[0]],
        isLoading: false,
        handleCreateButtonClick: () => console.log('Create button clicked'),
        deleteToken: (id: string) => console.log('Delete token:', id),
    },
}