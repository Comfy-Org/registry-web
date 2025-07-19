import { http, HttpResponse } from 'msw'
import { ListNodesForPublisherV2200, NodeStatus, PublisherStatus, type Node, type Publisher, type User } from '../api/generated'


export const CAPI = (path: `/${string}`) => {
    // api.comfy.org
    return new URL(path, process.env.NEXT_PUBLIC_BACKEND_URL!).toString()
}

// TODO: add algolia search handler...
export const ALGO = (path: `/${string}`) => {
    // algolia
    throw 'WIP'
}

// Mock data
const mockNodes: Node[] = [
    {
        id: '1',
        name: 'ComfyUI-AnimateDiff-Evolved',
        description: 'Advanced AnimateDiff implementation for ComfyUI',
        author: 'Kosinkadink',
        repository: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved',
        github_stars: 892,
        downloads: 5420,
        publisher: {
            id: 'kosinkadink',
            name: 'Kosinkadink',
            description: 'ComfyUI node developer',
            logo: 'https://avatars.githubusercontent.com/u/7365912?v=4',
            status: PublisherStatus.PublisherStatusActive,
            createdAt: '2023-01-01T00:00:00Z',
        },
        tags: ['animation', 'diffusion', 'video'],
        latest_version: {
            version: '3.0.0',
            downloadUrl: 'https://api.example.com/downloads/1/v3.0.0.zip'
        },
        license: 'MIT',
        icon: 'https://raw.githubusercontent.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved/main/icon.png',
        status: NodeStatus.NodeStatusActive,
        search_ranking: 5,
        preempted_comfy_node_names: ['AnimateDiffEvolvedLoader', 'AnimateDiffSampler'],
        created_at: '2023-06-01T00:00:00Z',

    },
    {
        id: '2',
        name: 'ComfyUI-Manager',
        description: 'Extension manager for ComfyUI',
        author: 'ltdrdata',
        repository: 'https://github.com/ltdrdata/ComfyUI-Manager',
        github_stars: 1245,
        downloads: 8934,
        publisher: {
            id: 'ltdrdata',
            name: 'ltdrdata',
            description: 'ComfyUI Manager developer',
            logo: 'https://avatars.githubusercontent.com/u/128333288?v=4',
            status: PublisherStatus.PublisherStatusActive,
            createdAt: '2023-02-01T00:00:00Z',
        },
        tags: ['manager', 'utility', 'tools'],
        latest_version: {
            version: '2.15.0',
            downloadUrl: 'https://api.example.com/downloads/2/v2.15.0.zip'
        },
        license: 'GPL-3.0',
        icon: 'https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/icon.png',
        status: NodeStatus.NodeStatusActive,
        search_ranking: 3,
        preempted_comfy_node_names: ['ManagerInstaller', 'ManagerUpdater'],
        created_at: '2023-08-01T00:00:00Z',
    },
]

const mockPublishers: Publisher[] = [
    {
        id: 'kosinkadink',
        name: 'Kosinkadink',
        description: 'ComfyUI node developer',
        logo: 'https://avatars.githubusercontent.com/u/7365912?v=4',
        status: PublisherStatus.PublisherStatusActive,
        createdAt: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ltdrdata',
        name: 'ltdrdata',
        description: 'ComfyUI Manager developer',
        logo: 'https://avatars.githubusercontent.com/u/128333288?v=4',
        status: PublisherStatus.PublisherStatusActive,
        createdAt: '2023-02-01T00:00:00Z',
    },
]

const mockUser: User = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isAdmin: false,
    isApproved: true,
}

export const handlers = [
    // Users endpoints
    http.get(CAPI('/users'), () => {
        return HttpResponse.json(mockUser)
    }),
    // Nodes endpoints
    http.get(CAPI('/nodes'), ({ request }) => {
        const url = new URL(request.url)
        const limit = parseInt(url.searchParams.get('limit') || '10')
        const offset = parseInt(url.searchParams.get('offset') || '0')
        const searchTerm = url.searchParams.get('search') || ''

        let filteredNodes = mockNodes
        if (searchTerm) {
            filteredNodes = mockNodes.filter(
                (node) =>
                    node.name?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    node.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            )
        }

        const total = filteredNodes.length
        const nodes = filteredNodes.slice(offset, offset + limit)

        const response: ListNodesForPublisherV2200 = {
            nodes,
            total,
            limit,
            page: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
        }

        return HttpResponse.json(response)
    }),

    http.get(CAPI('/nodes/:id'), ({ params }) => {
        const nodeId = params.id as string
        const node = mockNodes.find((n) => n.id === nodeId)

        if (!node) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(node)
    }),

    // Publishers endpoints
    http.get(CAPI('/publishers'), () => {
        return HttpResponse.json({
            publishers: mockPublishers,
            total: mockPublishers.length,
        })
    }),

    http.get(CAPI('/publishers/:id'), ({ params }) => {
        const publisherId = params.id as string
        const publisher = mockPublishers.find((p) => p.id === publisherId)

        if (!publisher) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json(publisher)
    }),

    // Featured nodes
    http.get(CAPI('/nodes/featured'), () => {
        return HttpResponse.json({
            nodes: mockNodes.slice(0, 3),
            total: 3,
        })
    }),

    // Node versions endpoints
    http.get(CAPI('/nodes/:id/versions'), ({ params, request }) => {
        const nodeId = params.id as string
        const node = mockNodes.find((n) => n.id === nodeId)

        if (!node) {
            return new HttpResponse(null, { status: 404 })
        }

        const url = new URL(request.url)
        const statuses = url.searchParams.getAll('statuses')

        const mockVersions = [
            {
                id: 'v1',
                version: '3.0.0',
                changelog: 'Major update with new features and bug fixes',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'active',
                downloadUrl: `https://api.example.com/downloads/${nodeId}/v3.0.0.zip`,
            },
            {
                id: 'v2',
                version: '2.1.0',
                changelog: 'Performance improvements and minor bug fixes',
                createdAt: '2023-12-01T14:20:00Z',
                status: 'active',
                downloadUrl: `https://api.example.com/downloads/${nodeId}/v2.1.0.zip`,
            },
            {
                id: 'v3',
                version: '2.0.0',
                changelog: 'Breaking changes - updated API interface',
                createdAt: '2023-10-15T09:45:00Z',
                status: 'active',
                downloadUrl: `https://api.example.com/downloads/${nodeId}/v2.0.0.zip`,
            },
        ]

        return HttpResponse.json(mockVersions)
    }),

    // User permissions endpoints
    http.get(CAPI('/publishers/:publisherId/nodes/:nodeId/permissions'), ({ params }) => {
        const publisherId = params.publisherId as string
        const nodeId = params.nodeId as string

        // Mock permissions - canEdit true for demo purposes
        return HttpResponse.json({
            canEdit: true,
            canDelete: true,
            canPublish: true,
        })
    }),

    // User's publishers
    http.get(CAPI('/users/publishers'), () => {
        return HttpResponse.json(mockPublishers)
    }),

    // Default fallback for unmatched requests
    http.get(CAPI('/*'), ({ request }) => {
        console.warn(`Unmatched request: ${request.method} ${request.url}`)
        return new HttpResponse(null, { status: 404 })
    }),
]
