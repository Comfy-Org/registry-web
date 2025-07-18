import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fn } from '@storybook/test'
import { Node, Publisher, User } from '@/src/api/generated'
import ClaimMyNodePage from '@/pages/publishers/[publisherId]/claim-my-node'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import React from 'react'

// Mock next/router
const mockRouter = {
    pathname: '/publishers/[publisherId]/claim-my-node',
    route: '/publishers/[publisherId]/claim-my-node',
    query: { 
        publisherId: 'publisher-1',
        nodeId: 'sample-node-1'
    },
    asPath: '/publishers/publisher-1/claim-my-node?nodeId=sample-node-1',
    push: fn(),
    replace: fn(),
    reload: fn(),
    back: fn(),
    prefetch: fn(),
    beforePopState: fn(),
    events: {
        on: fn(),
        off: fn(),
        emit: fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isPreview: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    locales: ['en'],
    locale: 'en',
    basePath: '',
}

// Sample data
const sampleNode: Node = {
    id: 'sample-node-1',
    name: 'Sample Custom Node',
    description: 'A sample ComfyUI custom node for testing purposes',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    rating: 4.5,
    repository: 'https://github.com/sample-user/sample-comfy-node',
    publisher: {
        id: UNCLAIMED_ADMIN_PUBLISHER_ID,
        name: 'Unclaimed Admin',
    },
}

const samplePublisher: Publisher = {
    id: 'publisher-1',
    name: 'My Publisher',
    description: 'My primary publisher account',
}

const sampleUser: User = {
    id: 'user-1',
    name: 'Sample User',
    email: 'user@example.com',
}

// Setup the component with proper mocks
const ClaimMyNodePageWithMocks = ({ mockData }: { mockData?: any }) => {
    // Mock the hooks directly in React context
    const mockHooks = React.useMemo(() => ({
        useGetNode: () => mockData?.useGetNode || {
            data: sampleNode,
            isLoading: false,
            error: null,
        },
        useGetPublisher: () => mockData?.useGetPublisher || {
            data: samplePublisher,
            isLoading: false,
            error: null,
        },
        useGetUser: () => mockData?.useGetUser || {
            data: sampleUser,
            isLoading: false,
            error: null,
        },
        useClaimMyNode: () => mockData?.useClaimMyNode || {
            mutate: fn(),
            isPending: false,
            error: null,
        },
    }), [mockData])

    // Use React.createElement to bypass direct import dependencies
    return React.createElement(ClaimMyNodePage)
}

const meta: Meta<typeof ClaimMyNodePageWithMocks> = {
    title: 'Pages/ClaimMyNodePage',
    component: ClaimMyNodePageWithMocks,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        nextjs: {
            router: mockRouter,
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        staleTime: 0,
                    },
                },
            })

            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                </QueryClientProvider>
            )
        },
    ],
}

export default meta
type Story = StoryObj<typeof ClaimMyNodePageWithMocks>

export const InitialStage: Story = {
    args: {},
    parameters: {
        msw: {
            handlers: [],
        },
    },
}

export const Loading: Story = {
    args: {
        mockData: {
            useGetNode: {
                data: undefined,
                isLoading: true,
                error: null,
            },
            useGetPublisher: {
                data: undefined,
                isLoading: true,
                error: null,
            },
            useGetUser: {
                data: undefined,
                isLoading: true,
                error: null,
            },
            useClaimMyNode: {
                mutate: fn(),
                isPending: false,
                error: null,
            },
        },
    },
}

export const WithoutRepository: Story = {
    args: {
        mockData: {
            useGetNode: {
                data: {
                    ...sampleNode,
                    repository: undefined,
                },
                isLoading: false,
                error: null,
            },
            useGetPublisher: {
                data: samplePublisher,
                isLoading: false,
                error: null,
            },
            useGetUser: {
                data: sampleUser,
                isLoading: false,
                error: null,
            },
            useClaimMyNode: {
                mutate: fn(),
                isPending: false,
                error: null,
            },
        },
    },
}

export const AlreadyClaimed: Story = {
    args: {
        mockData: {
            useGetNode: {
                data: {
                    ...sampleNode,
                    publisher: {
                        id: 'existing-publisher',
                        name: 'Existing Publisher',
                    },
                },
                isLoading: false,
                error: null,
            },
            useGetPublisher: {
                data: samplePublisher,
                isLoading: false,
                error: null,
            },
            useGetUser: {
                data: sampleUser,
                isLoading: false,
                error: null,
            },
            useClaimMyNode: {
                mutate: fn(),
                isPending: false,
                error: null,
            },
        },
    },
}