import NodeDetails from '@/components/nodes/NodeDetails'
import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CAPI, handlers } from '@/src/mocks/handlers'
import { http, HttpResponse } from 'msw'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { Node, NodeStatus, PublisherStatus } from '@/src/api/generated'

const meta: Meta<typeof NodeDetails> = {
    title: 'Components/Nodes/NodeDetails',
    component: NodeDetails,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        msw: {
            handlers: handlers,
        },
        nextjs: {
            router: {
                query: { nodeId: 'example-comfyui-custom-node' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NodeDetails>

export const Default: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'example-comfyui-custom-node' },
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
                        description:
                            'This is a test node for demonstration purposes',
                    })
                }),
                ...handlers,
            ],
        },
    },
}

export const WithPublisherRoute: Story = {
    parameters: {
        nextjs: {
            router: {
                query: {
                    publisherId: 'kosinkadink',
                    nodeId: 'example-comfyui-custom-node',
                },
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
                query: { nodeId: 'example-comfyui-custom-node' },
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
                http.get(CAPI('/nodes/nonexistent'), () => {
                    return new HttpResponse(null, { status: 404 })
                }),
                ...handlers,
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
                        description:
                            'This node has not been claimed by any publisher yet',
                        author: 'Unknown',
                        repository: 'https://github.com/example/unclaimed-node',
                        downloads: 0,
                        publisher: {
                            id: UNCLAIMED_ADMIN_PUBLISHER_ID,
                            name: 'Unclaimed Admin Publisher',
                            display_name: 'Unclaimed',
                            description: 'System publisher for unclaimed nodes',
                            status: PublisherStatus.PublisherStatusActive,
                            created_at: '2023-01-01T00:00:00Z',
                        },
                        status: NodeStatus.NodeStatusActive,
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
                query: { nodeId: 'example-comfyui-custom-node' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                http.get(
                    CAPI('/publishers/:publisherId/nodes/:nodeId/permissions'),
                    () => {
                        return HttpResponse.json({
                            canEdit: true,
                            canDelete: true,
                            canPublish: true,
                        })
                    }
                ),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'admin-user',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        isAdmin: true,
                        isApproved: true,
                    })
                }),
                http.get(CAPI('/users/publishers'), () => {
                    return HttpResponse.json({
                        id: 'admin-user',
                        name: 'Admin User',
                        email: 'admin@example.com',
                        isAdmin: true,
                        isApproved: true,
                    })
                }),

                ...handlers,
            ],
        },
    },
}

export const NoPermissions: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'example-comfyui-custom-node' },
                pathname: '/nodes/[nodeId]',
                asPath: '/nodes/1',
                isReady: true,
            },
        },
        msw: {
            handlers: [
                http.get(
                    CAPI('/publishers/:publisherId/nodes/:nodeId/permissions'),
                    () => {
                        return HttpResponse.json({
                            canEdit: false,
                            canDelete: false,
                            canPublish: false,
                        })
                    }
                ),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'regular-user',
                        name: 'Regular User',
                        email: 'user@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
                ...handlers,
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
                            status: PublisherStatus.PublisherStatusActive,
                            created_at: '2023-01-01T00:00:00Z',
                        },
                        latest_version: {
                            version: '1.0.0',
                            downloadUrl:
                                'https://api.example.com/downloads/no-icon/v1.0.0.zip',
                        },
                        status: NodeStatus.NodeStatusActive,
                        created_at: '2023-01-01T00:00:00Z',
                        updated_at: '2023-01-01T00:00:00Z',
                    })
                }),
                ...handlers,
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
                http.get(CAPI('/nodes/many-versions'), () => {
                    return HttpResponse.json({
                        id: 'many-versions',
                        name: 'Node With Many Versions',
                        description: 'This node has multiple version releases',
                        author: 'Prolific Developer',
                        repository:
                            'https://github.com/example/many-versions-node',
                        downloads: 5000,
                        publisher: {
                            id: 'prolific-dev',
                            name: 'Prolific Developer',
                            description: 'Active node developer',
                            status: PublisherStatus.PublisherStatusActive,
                        },
                        latest_version: {
                            version: '5.2.1',
                            downloadUrl:
                                'https://api.example.com/downloads/many-versions/v5.2.1.zip',
                        },
                        status: NodeStatus.NodeStatusActive,
                        created_at: '2023-01-01T00:00:00Z',
                    } satisfies Node)
                }),
                http.get(CAPI('/nodes/many-versions/versions'), () => {
                    const versions = [
                        {
                            version: '5.2.1',
                            changelog:
                                'Latest bug fixes and performance improvements',
                            date: '2024-01-15T10:30:00Z',
                        },
                        {
                            version: '5.2.0',
                            changelog:
                                'Added new features and improved stability',
                            date: '2024-01-01T14:20:00Z',
                        },
                        {
                            version: '5.1.0',
                            changelog:
                                'Major performance optimizations and bug fixes',
                            date: '2023-12-15T09:45:00Z',
                        },
                        {
                            version: '5.0.0',
                            changelog:
                                'Breaking changes: Complete API rewrite for better performance',
                            date: '2023-11-01T12:00:00Z',
                        },
                        {
                            version: '4.9.2',
                            changelog:
                                'Final release of v4 series - legacy support',
                            date: '2023-10-15T08:30:00Z',
                        },
                        {
                            version: '4.9.1',
                            changelog:
                                'Critical security fixes and stability improvements',
                            date: '2023-09-20T16:15:00Z',
                        },
                        {
                            version: '4.9.0',
                            changelog:
                                'New animation features and improved UI controls',
                            date: '2023-08-10T11:45:00Z',
                        },
                        {
                            version: '4.8.3',
                            changelog:
                                'Bug fixes for memory leak and crash issues',
                            date: '2023-07-25T09:20:00Z',
                        },
                        {
                            version: '4.8.2',
                            changelog:
                                'Performance optimizations for large datasets',
                            date: '2023-06-30T14:10:00Z',
                        },
                        {
                            version: '4.8.1',
                            changelog: 'Hotfix for rendering pipeline issues',
                            date: '2023-06-15T08:40:00Z',
                        },
                        {
                            version: '4.8.0',
                            changelog: 'Major update with new rendering engine',
                            date: '2023-05-20T13:25:00Z',
                        },
                        {
                            version: '4.7.5',
                            changelog:
                                'Compatibility fixes for latest ComfyUI version',
                            date: '2023-04-18T10:55:00Z',
                        },
                        {
                            version: '4.7.4',
                            changelog:
                                'Minor bug fixes and documentation updates',
                            date: '2023-03-22T15:30:00Z',
                        },
                        {
                            version: '4.7.3',
                            changelog: 'Enhanced error handling and logging',
                            date: '2023-02-28T12:15:00Z',
                        },
                        {
                            version: '4.7.2',
                            changelog: 'Fixed issues with batch processing',
                            date: '2023-01-30T09:45:00Z',
                        },
                        {
                            version: '4.7.1',
                            changelog:
                                'Initial stable release with core features',
                            date: '2023-01-15T14:20:00Z',
                        },
                    ]

                    return HttpResponse.json(
                        versions.map((v, index) => ({
                            id: `v${index + 1}`,
                            version: v.version,
                            changelog: v.changelog,
                            createdAt: v.date,
                            status: 'active',
                            downloadUrl: `https://api.example.com/downloads/many-versions/v${v.version}.zip`,
                        }))
                    )
                }),
                ...handlers,
            ],
        },
    },
}
