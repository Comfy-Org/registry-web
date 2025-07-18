import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Mock function for actions
import { Node, Publisher } from '@/src/api/generated'
import ClaimNodePage from '@/pages/nodes/[nodeId]/claim'

const meta: Meta<typeof ClaimNodePage> = {
    title: 'Pages/ClaimNodePage',
    component: ClaimNodePage,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        nextjs: {
            appDirectory: false,
            navigation: {
                pathname: '/nodes/sample-node-1/claim',
                query: { nodeId: 'sample-node-1' },
                push: () => {},
                replace: () => {},
                back: () => {},
            },
            router: {
                pathname: '/nodes/[nodeId]/claim',
                route: '/nodes/[nodeId]/claim',
                query: { nodeId: 'sample-node-1' },
                asPath: '/nodes/sample-node-1/claim',
                push: () => Promise.resolve(true),
                replace: () => Promise.resolve(true),
                reload: () => {},
                back: () => {},
                prefetch: () => Promise.resolve(),
                beforePopState: () => {},
                events: {
                    on: () => {},
                    off: () => {},
                    emit: () => {},
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
            },
        },
    },
    tags: ['autodocs'],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
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
type Story = StoryObj<typeof ClaimNodePage>

// Sample data
const sampleUnclaimedNode: Node = {
    id: 'sample-node-1',
    name: 'Sample Custom Node',
    description: 'A sample ComfyUI custom node for testing purposes',
    icon: 'https://via.placeholder.com/200',
    downloads: 1250,
    rating: 4.5,
    repository: 'https://github.com/sample-user/sample-comfy-node',
    publisher: {
        id: 'unclaimed-admin',
        name: 'Unclaimed Admin',
    },
}

const sampleClaimedNode: Node = {
    ...sampleUnclaimedNode,
    id: 'claimed-node-1',
    name: 'Already Claimed Node',
    publisher: {
        id: 'existing-publisher',
        name: 'Existing Publisher',
    },
}

const samplePublishers: Publisher[] = [
    {
        id: 'publisher-1',
        name: 'My First Publisher',
        description: 'My primary publisher account',
    },
    {
        id: 'publisher-2',
        name: 'Secondary Publisher',
        description: 'Alternative publisher account',
    },
]

export const WithPublishers: Story = {
    parameters: {
        msw: {
            handlers: [
                // Mock API responses for WithPublishers scenario
            ],
        },
    },
}

export const WithoutPublishers: Story = {
    parameters: {
        msw: {
            handlers: [
                // Mock API responses for WithoutPublishers scenario
            ],
        },
    },
}

export const AlreadyClaimed: Story = {
    parameters: {
        msw: {
            handlers: [
                // Mock API responses for AlreadyClaimed scenario
            ],
        },
    },
}

export const Loading: Story = {
    parameters: {
        msw: {
            handlers: [
                // Mock API responses for Loading scenario
            ],
        },
    },
}

export const WithoutRepository: Story = {
    parameters: {
        msw: {
            handlers: [
                // Mock API responses for WithoutRepository scenario
            ],
        },
    },
}