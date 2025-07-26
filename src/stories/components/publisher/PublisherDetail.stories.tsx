import PublisherDetail from '@/components/publisher/PublisherDetail'
import {
    Publisher,
    PublisherStatus,
    PersonalAccessToken,
} from '@/src/api/generated'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CAPI, handlers } from '@/src/mocks/handlers'
import { http, HttpResponse } from 'msw'

const meta: Meta<typeof PublisherDetail> = {
    title: 'Components/Publisher/PublisherDetail',
    component: PublisherDetail,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [{ name: 'dark', value: '#111827' }],
        },
        msw: {
            handlers: handlers,
        },
        nextjs: {
            router: {
                pathname: '/publishers/[publisherId]',
                asPath: '/publishers/test-publisher',
                isReady: true,
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof PublisherDetail>

const mockPublisher: Publisher = {
    id: 'test-publisher',
    name: 'Test Publisher',
    status: PublisherStatus.PublisherStatusActive,
    members: [
        {
            user: {
                name: 'Test User',
                email: 'test@example.com',
            },
            role: 'owner',
        },
    ],
}

const mockAccessTokens: PersonalAccessToken[] = [
    {
        id: 'token-1',
        name: 'Main Token',
        description: 'Token for publishing nodes',
        createdAt: '2024-01-15T10:30:00Z',
    },
    {
        id: 'token-2',
        name: 'CI/CD Token',
        description: 'Token for automated deployments',
        createdAt: '2024-01-20T15:45:00Z',
    },
]

export const Default: Story = {
    args: {
        publisher: mockPublisher,
    },
    parameters: {
        docs: {
            description: {
                story: 'The PublisherDetail component with the new publish instruction banner before the API Keys section.',
            },
        },
    },
}

export const WithEditPermissions: Story = {
    args: {
        publisher: mockPublisher,
    },
    parameters: {
        docs: {
            description: {
                story: 'The PublisherDetail component with edit permissions, showing the API Keys section and publish instruction banner.',
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/publishers/test-publisher/permissions'), () => {
                    return HttpResponse.json({
                        canEdit: true,
                    })
                }),
                http.get(CAPI('/publishers/test-publisher/tokens'), () => {
                    return HttpResponse.json(mockAccessTokens)
                }),
                http.get(CAPI('/publishers/test-publisher/nodes/v2'), () => {
                    return HttpResponse.json({
                        total: 5,
                        data: [],
                    })
                }),
            ],
        },
    },
}
