import { http, HttpResponse } from 'msw'
import type { Node, Publisher, User } from '../api/generated'

export const CAPI = (path:`/${string}`) => {
    return new URL(path, process.env.NEXT_PUBLIC_BACKEND_URL!).toString()
}

// Mock data
const mockNodes: Node[] = [
    {
        id: '1',
        name: 'ComfyUI-AnimateDiff-Evolved',
        description: 'Advanced AnimateDiff implementation for ComfyUI',
        author: 'Kosinkadink',
        reference: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved',
        repository: 'https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved',
        files: ['https://github.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved'],
        install_type: 'git-clone',
        pip: ['diffusers', 'transformers'],
        title: 'AnimateDiff Evolved',
        nodename_pattern: 'AnimateDiff',
        total_install: 5420,
        total_star: 892,
        downloads: 5420,
        publisher: {
            id: 'kosinkadink',
            name: 'Kosinkadink',
            display_name: 'Kosinkadink',
            description: 'ComfyUI node developer',
            github_username: 'Kosinkadink',
            avatar: 'https://avatars.githubusercontent.com/u/7365912?v=4',
            email: 'kosinkadink@example.com',
            status: 'approved',
            created_at: '2023-01-01T00:00:00Z',
        },
        tags: ['animation', 'diffusion', 'video'],
        latest_version: {
            version: '3.0.0',
            downloadUrl: 'https://api.example.com/downloads/1/v3.0.0.zip'
        },
        last_updated: '2024-01-15T10:30:00Z',
        license: 'MIT',
        icon: 'https://raw.githubusercontent.com/Kosinkadink/ComfyUI-AnimateDiff-Evolved/main/icon.png',
        status: 'approved',
        search_ranking: 5,
        preempted_comfy_node_names: ['AnimateDiffEvolvedLoader', 'AnimateDiffSampler'],
        created_at: '2023-06-01T00:00:00Z',
        updated_at: '2024-01-15T10:30:00Z',
    },
    {
        id: '2',
        name: 'ComfyUI-Manager',
        description: 'Extension manager for ComfyUI',
        author: 'ltdrdata',
        reference: 'https://github.com/ltdrdata/ComfyUI-Manager',
        repository: 'https://github.com/ltdrdata/ComfyUI-Manager',
        files: ['https://github.com/ltdrdata/ComfyUI-Manager'],
        install_type: 'git-clone',
        pip: ['gitpython', 'tqdm'],
        title: 'ComfyUI Manager',
        nodename_pattern: 'Manager',
        total_install: 8934,
        total_star: 1245,
        downloads: 8934,
        publisher: {
            id: 'ltdrdata',
            name: 'ltdrdata',
            display_name: 'ltdrdata',
            description: 'ComfyUI Manager developer',
            github_username: 'ltdrdata',
            avatar: 'https://avatars.githubusercontent.com/u/128333288?v=4',
            email: 'ltdrdata@example.com',
            status: 'approved',
            created_at: '2023-02-01T00:00:00Z',
        },
        tags: ['manager', 'utility', 'tools'],
        latest_version: {
            version: '2.15.0',
            downloadUrl: 'https://api.example.com/downloads/2/v2.15.0.zip'
        },
        last_updated: '2024-01-20T14:15:00Z',
        license: 'GPL-3.0',
        icon: 'https://raw.githubusercontent.com/ltdrdata/ComfyUI-Manager/main/icon.png',
        status: 'approved',
        search_ranking: 3,
        preempted_comfy_node_names: ['ManagerInstaller', 'ManagerUpdater'],
        created_at: '2023-08-01T00:00:00Z',
        updated_at: '2024-01-20T14:15:00Z',
    },
]

const mockPublishers: Publisher[] = [
    {
        id: 'kosinkadink',
        name: 'Kosinkadink',
        display_name: 'Kosinkadink',
        description: 'ComfyUI node developer',
        github_username: 'Kosinkadink',
        avatar: 'https://avatars.githubusercontent.com/u/7365912?v=4',
        email: 'kosinkadink@example.com',
        status: 'approved',
        created_at: '2023-01-01T00:00:00Z',
    },
    {
        id: 'ltdrdata',
        name: 'ltdrdata',
        display_name: 'ltdrdata',
        description: 'ComfyUI Manager developer',
        github_username: 'ltdrdata',
        avatar: 'https://avatars.githubusercontent.com/u/128333288?v=4',
        email: 'ltdrdata@example.com',
        status: 'approved',
        created_at: '2023-02-01T00:00:00Z',
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
                    node.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    node.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase())
            )
        }

        const total = filteredNodes.length
        const nodes = filteredNodes.slice(offset, offset + limit)

        const response: NodeListResponse = {
            nodes,
            total,
            limit,
            offset,
            has_more: offset + limit < total,
        }

        return HttpResponse.json(response)
    }),

    http.get('/nodes/:id', ({ params }) => {
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

    // Node stats
    http.get(CAPI('/nodes/:id/stats'), ({ params }) => {
        const nodeId = params.id as string
        const node = mockNodes.find((n) => n.id === nodeId)

        if (!node) {
            return new HttpResponse(null, { status: 404 })
        }

        return HttpResponse.json({
            total_install: node.total_install,
            total_star: node.total_star,
            weekly_downloads: Math.floor(Math.random() * 1000),
            monthly_downloads: Math.floor(Math.random() * 5000),
        })
    }),

    // Search suggestions
    http.get(CAPI('/search/suggestions'), ({ request }) => {
        const url = new URL(request.url)
        const query = url.searchParams.get('q') || ''

        if (!query) {
            return HttpResponse.json({ suggestions: [] })
        }

        const suggestions = mockNodes
            .filter((node) =>
                node.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5)
            .map((node) => ({
                text: node.name,
                type: 'node',
                id: node.id,
            }))

        return HttpResponse.json({ suggestions })
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
