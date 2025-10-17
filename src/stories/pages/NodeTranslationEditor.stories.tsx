import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HttpResponse, http } from 'msw'
import { NodeStatus, PublisherStatus } from '@/src/api/generated'
import { CAPI } from '@/src/mocks/handlers'
import NodeTranslationEditor from '../../../pages/nodes/[nodeId]/i18n'

const meta: Meta<typeof NodeTranslationEditor> = {
    title: 'Pages/NodeTranslationEditor',
    component: NodeTranslationEditor,
    parameters: {
        layout: 'fullscreen',
        backgrounds: { default: 'dark' },
        nextjs: {
            router: {
                query: { nodeId: 'test-node' },
                pathname: '/nodes/[nodeId]/i18n',
                asPath: '/nodes/test-node/i18n',
                isReady: true,
            },
        },
    },
    tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof NodeTranslationEditor>

const mockNode = {
    id: 'test-node',
    name: 'Test Node',
    description: 'A sample node for testing translation functionality',
    author: 'Test Author',
    category: 'Testing',
    tags: ['test', 'sample', 'demo'],
    repository: 'https://github.com/example/test-node',
    downloads: 1234,
    publisher: {
        id: 'test-publisher',
        name: 'Test Publisher',
        display_name: 'Test Publisher',
        description: 'Test publisher for demonstration',
        status: PublisherStatus.PublisherStatusActive,
        created_at: '2023-01-01T00:00:00Z',
    },
    status: NodeStatus.NodeStatusActive,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
}

export const Default: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), ({ request }) => {
                    const url = new URL(request.url)
                    const includeTranslations = url.searchParams.get(
                        'include_translations'
                    )

                    if (includeTranslations === 'true') {
                        return HttpResponse.json({
                            ...mockNode,
                            translations: {
                                zh: {
                                    name: '测试节点',
                                    description: '用于测试翻译功能的示例节点',
                                    category: '测试',
                                },
                                ja: {
                                    name: 'テストノード',
                                    description:
                                        '翻訳機能をテストするためのサンプルノード',
                                },
                            },
                        })
                    }

                    return HttpResponse.json(mockNode)
                }),
                http.post(CAPI('/nodes/test-node/translations'), () => {
                    return new HttpResponse(null, { status: 204 })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
                http.get(
                    CAPI(
                        '/publishers/test-publisher/nodes/test-node/permissions'
                    ),
                    () => {
                        return HttpResponse.json({
                            canEdit: true,
                            canDelete: true,
                        })
                    }
                ),
            ],
        },
    },
}

export const WithExistingTranslations: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), ({ request }) => {
                    const url = new URL(request.url)
                    const includeTranslations = url.searchParams.get(
                        'include_translations'
                    )

                    if (includeTranslations === 'true') {
                        return HttpResponse.json({
                            ...mockNode,
                            translations: {
                                en: {
                                    name: 'Test Node',
                                    description:
                                        'A sample node for testing translation functionality',
                                    category: 'Testing',
                                    customField: 'Custom content',
                                },
                                zh: {
                                    name: '测试节点',
                                    description: '用于测试翻译功能的示例节点',
                                    category: '测试',
                                    customField: '自定义内容',
                                },
                                ja: {
                                    name: 'テストノード',
                                    description:
                                        '翻訳機能をテストするためのサンプルノード',
                                    category: 'テスト',
                                    customField: 'カスタムコンテンツ',
                                },
                                fr: {
                                    name: 'Nœud de Test',
                                    description:
                                        'Un nœud exemple pour tester la fonctionnalité de traduction',
                                    category: 'Test',
                                },
                            },
                        })
                    }

                    return HttpResponse.json(mockNode)
                }),
                http.post(CAPI('/nodes/test-node/translations'), () => {
                    return new HttpResponse(null, { status: 204 })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
                http.get(
                    CAPI(
                        '/publishers/test-publisher/nodes/test-node/permissions'
                    ),
                    () => {
                        return HttpResponse.json({
                            canEdit: true,
                            canDelete: true,
                        })
                    }
                ),
            ],
        },
    },
}

export const LoadingState: Story = {
    parameters: {
        nextjs: {
            router: {
                query: { nodeId: 'test-node' },
                pathname: '/nodes/[nodeId]/i18n',
                asPath: '/nodes/test-node/i18n',
                isReady: false,
            },
        },
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), () => {
                    return new Promise(() => {}) // Never resolves to show loading state
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
            ],
        },
    },
}

export const NodeNotFound: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), () => {
                    return new HttpResponse(null, { status: 404 })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
            ],
        },
    },
}

export const SaveError: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), ({ request }) => {
                    const url = new URL(request.url)
                    const includeTranslations = url.searchParams.get(
                        'include_translations'
                    )

                    if (includeTranslations === 'true') {
                        return HttpResponse.json({
                            ...mockNode,
                            translations: {
                                zh: {
                                    name: '测试节点',
                                    description: '用于测试翻译功能的示例节点',
                                },
                            },
                        })
                    }

                    return HttpResponse.json(mockNode)
                }),
                http.post(CAPI('/nodes/test-node/translations'), () => {
                    return new HttpResponse(null, { status: 500 })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
                http.get(
                    CAPI(
                        '/publishers/test-publisher/nodes/test-node/permissions'
                    ),
                    () => {
                        return HttpResponse.json({
                            canEdit: true,
                            canDelete: true,
                        })
                    }
                ),
            ],
        },
    },
}

export const NoTranslations: Story = {
    parameters: {
        msw: {
            handlers: [
                http.get(CAPI('/nodes/test-node'), ({ request }) => {
                    const url = new URL(request.url)
                    const includeTranslations = url.searchParams.get(
                        'include_translations'
                    )

                    if (includeTranslations === 'true') {
                        return HttpResponse.json({
                            ...mockNode,
                            translations: {},
                        })
                    }

                    return HttpResponse.json(mockNode)
                }),
                http.post(CAPI('/nodes/test-node/translations'), () => {
                    return new HttpResponse(null, { status: 204 })
                }),
                http.get(CAPI('/users'), () => {
                    return HttpResponse.json({
                        id: 'user-1',
                        name: 'Test User',
                        email: 'test@example.com',
                        isAdmin: false,
                        isApproved: true,
                    })
                }),
                http.get(
                    CAPI(
                        '/publishers/test-publisher/nodes/test-node/permissions'
                    ),
                    () => {
                        return HttpResponse.json({
                            canEdit: true,
                            canDelete: true,
                        })
                    }
                ),
            ],
        },
    },
}
