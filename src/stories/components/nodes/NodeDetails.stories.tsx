import NodeDetails from '@/components/nodes/NodeDetails'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CAPI, handlers } from '@/src/mocks/handlers'
import { http, HttpResponse } from 'msw'
import { WithQueryClientProvider } from '../WithQueryClientProvider'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'

// Create a wrapper component to provide the query client
const NodeDetailsWithQueryClient = (props) => {
    return (
        <WithQueryClientProvider>
            <NodeDetails {...props} />
        </WithQueryClientProvider>
    )
}

const meta: Meta<typeof NodeDetailsWithQueryClient> = {
    title: 'Components/Nodes/NodeDetails',
    component: NodeDetailsWithQueryClient,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
        nextjs: {
            router: {
                query: { nodeId: '1' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NodeDetailsWithQueryClient>

export const Default: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: '1' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                http.get(CAPI('/nodes/1'), () => {
                    return HttpResponse.json({
                        id: '1',
                        name: 'Test Node',
                        description: 'This is a test node for demonstration purposes',
                    })
                }),
                // ...handlers,
            ],
        },
    },
}

export const WithPublisherRoute: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { publisherId: 'kosinkadink', nodeId: '1' },
                pathname: '/publishers/[publisherId]/nodes/[nodeId]',
                asPath: '/publishers/kosinkadink/nodes/1',
                isReady: true,
            },
        },
    },
}

export const Loading: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: '1' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: false,
            },
        },
    },
}

export const NodeNotFound: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'nonexistent' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/nonexistent',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/nodes/nonexistent'), () => {
                    return new HttpResponse(null, { status: 404 })
                }),
            ],
        },
    },
}

export const UnclaimedNode: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'unclaimed' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/unclaimed',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                http.get(CAPI('/nodes/unclaimed'), () => {
                    return HttpResponse.json({
                        id: 'unclaimed',
                        name: 'Unclaimed Node',
                        description: 'This node has not been claimed by any publisher yet',
                        author: 'Unknown',
                        repository: 'https://github.com/example/unclaimed-node',
                        downloads: 0,
                        publisher: {
                            id: UNCLAIMED_ADMIN_PUBLISHER_ID,
                            name: 'Unclaimed Admin Publisher',
                            display_name: 'Unclaimed',
                            description: 'System publisher for unclaimed nodes',
                            status: 'approved',
                            created_at: '2023-01-01T00:00:00Z',
                        },
                        status: 'approved',
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2023-01-01T00:00:00Z',
                    })
                }),
                http.get(CAPI('/nodes/unclaimed/versions'), () => {
                    return HttpResponse.json([])
                }),
                ...handlers,
            ],
        },
    },
}

export const AdminUser: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: '1' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'admin-user',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        isAdmin: true,
                        isApproved: true,
                    })
                }),
            ],
        },
    },
}

export const NoPermissions: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: '1' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/publishers/:publisherId/nodes/:nodeId/permissions'), () => {
                    return HttpResponse.json({
                        canEdit: false,
                        canDelete: false,
                        canPublish: false,
                    })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'regular-user',
                        name: 'Regular User',
                        email: 'user@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
            ],
        },
    },
}

export const NodeWithoutIcon: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'no-icon' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/no-icon',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/nodes/no-icon'), () => {
                    return HttpResponse.json({
                        id: 'no-icon',
                        name: 'Node Without Icon',
                        description: 'This node does not have a custom icon',
                        author: 'Test Author',
                        repository: 'https://github.com/example/no-icon-node',
                        downloads: 1234,
                        publisher: {
                            id: 'test-publisher',
                            name: 'Test Publisher',
                            display_name: 'Test Publisher',
                            description: 'Test publisher description',
                            status: 'approved',
                            created_at: '2023-01-01T00:00:00Z',
                        },
                        latest_version: {
                            version: '1.0.0',
                            downloadUrl: 'https://api.example.com/downloads/no-icon/v1.0.0.zip'
                        },
                        status: 'approved',
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2023-01-01T00:00:00Z',
                    })
                }),
            ],
        },
    },
}

export const NodeWithManyVersions: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'many-versions' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/many-versions',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                ...handlers,
                http.get(CAPI('/nodes/many-versions'), () => {
                    return HttpResponse.json({
                        id: 'many-versions',
                        name: 'Node With Many Versions',
                        description: 'This node has multiple version releases',
                        author: 'Prolific Developer',
                        repository: 'https://github.com/example/many-versions-node',
                        downloads: 5000,
                        publisher: {
                            id: 'prolific-dev',
                            name: 'Prolific Developer',
                            display_name: 'Prolific Developer',
                            description: 'Active node developer',
                            status: 'approved',
                            created_at: '2023-01-01T00:00:00Z',
                        },
                        latest_version: {
                            version: '5.2.1',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v5.2.1.zip'
                        },
                        status: 'approved',
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2024-01-15T10:30:00Z',
                    })
                }),
                http.get(CAPI('/nodes/many-versions/versions'), () => {
                    return HttpResponse.json([
                        {
                            id: 'v1',
                            version: '5.2.1',
                            changelog: 'Latest bug fixes and performance improvements',
                            createdAt: '2024-01-15T10:30:00Z',
                            status: 'active',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v5.2.1.zip',
                        },
                        {
                            id: 'v2',
                            version: '5.2.0',
                            changelog: 'Added new features and improved stability',
                            createdAt: '2024-01-01T14:20:00Z',
                            status: 'active',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v5.2.0.zip',
                        },
                        {
                            id: 'v3',
                            version: '5.1.0',
                            changelog: 'Major performance optimizations and bug fixes',
                            createdAt: '2023-12-15T09:45:00Z',
                            status: 'active',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v5.1.0.zip',
                        },
                        {
                            id: 'v4',
                            version: '5.0.0',
                            changelog: 'Breaking changes: Complete API rewrite for better performance',
                            createdAt: '2023-11-01T12:00:00Z',
                            status: 'active',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v5.0.0.zip',
                        },
                        {
                            id: 'v5',
                            version: '4.9.2',
                            changelog: 'Final release of v4 series - legacy support',
                            createdAt: '2023-10-15T08:30:00Z',
                            status: 'active',
                            downloadUrl: 'https://api.example.com/downloads/many-versions/v4.9.2.zip',
                        },
                    ])
                }),
            ],
        },
    },
}