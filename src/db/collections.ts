import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/react-query'
import type { Node, Publisher, NodeVersion } from '@/src/api/generated'
import {
    listAllNodes,
    getNode,
    getPublisher,
    listNodeVersions,
} from '@/src/api/generated'

// Global query client - will be set during app initialization
let globalQueryClient: QueryClient | null = null

export function setQueryClient(queryClient: QueryClient) {
    globalQueryClient = queryClient
}

function getQueryClient() {
    if (!globalQueryClient) {
        throw new Error(
            'QueryClient not initialized. Call setQueryClient first.'
        )
    }
    return globalQueryClient
}

// Lazy collection creation to avoid initialization issues during build
let _nodesCollection: ReturnType<typeof createCollection> | null = null

export function getNodesCollection() {
    if (!_nodesCollection) {
        _nodesCollection = createCollection(
            queryCollectionOptions<Node>({
                queryKey: ['nodes'],
                queryFn: async () => {
                    const response = await listAllNodes({
                        limit: 1000,
                        page: 1,
                    })
                    return response.nodes || []
                },
                queryClient: getQueryClient(),
                getKey: (node) => node.id || '',
                // Enable automatic refetching
                refetchInterval: 30000, // 30 seconds
                staleTime: 0,
                // Persistence handlers for optimistic updates
                onInsert: async ({ transaction }) => {
                    // Handle creating new nodes (if API supports it)
                    console.log(
                        'Inserting nodes:',
                        transaction.mutations.length
                    )
                    // In a real app, you'd call your create API here
                },
                onUpdate: async ({ transaction }) => {
                    // Handle updating nodes
                    console.log('Updating nodes:', transaction.mutations.length)
                    // In a real app, you'd call your update API here
                },
                onDelete: async ({ transaction }) => {
                    // Handle deleting nodes
                    console.log('Deleting nodes:', transaction.mutations.length)
                    // In a real app, you'd call your delete API here
                },
            })
        )
    }
    return _nodesCollection
}

// For backwards compatibility
export const nodesCollection = new Proxy({} as any, {
    get(_, prop) {
        return getNodesCollection()[
            prop as keyof ReturnType<typeof getNodesCollection>
        ]
    },
})

// Lazy publishers collection
let _publishersCollection: ReturnType<typeof createCollection> | null = null

export function getPublishersCollection() {
    if (!_publishersCollection) {
        _publishersCollection = createCollection(
            queryCollectionOptions<Publisher>({
                queryKey: ['publishers'],
                queryFn: async () => {
                    // Note: This would need to be implemented in the API
                    // For now, return empty array since listPublishers doesn't exist
                    return []
                },
                queryClient: getQueryClient(),
                getKey: (publisher) => publisher.id || '',
                refetchInterval: 60000, // 1 minute
                staleTime: 0,
            })
        )
    }
    return _publishersCollection
}

// For backwards compatibility
export const publishersCollection = new Proxy({} as any, {
    get(_, prop) {
        return getPublishersCollection()[
            prop as keyof ReturnType<typeof getPublishersCollection>
        ]
    },
})

// Node Versions Collection Factory - creates collections per node
export const createNodeVersionsCollection = (nodeId: string) => {
    return createCollection(
        queryCollectionOptions<NodeVersion>({
            queryKey: ['node-versions', nodeId],
            queryFn: async () => {
                const response = await listNodeVersions(nodeId, {
                    statuses: ['NodeVersionStatusActive' as any],
                })
                return response || []
            },
            queryClient: getQueryClient(),
            getKey: (version) => version.id || '',
            refetchInterval: 30000,
            staleTime: 0,
        })
    )
}

// Individual Node Collection Factory - for single node queries
export const createSingleNodeCollection = (nodeId: string) => {
    return createCollection(
        queryCollectionOptions<Node>({
            queryKey: ['node', nodeId],
            queryFn: async () => {
                const node = await getNode(nodeId)
                return node ? [node] : []
            },
            queryClient: getQueryClient(),
            getKey: (node) => node.id || '',
            refetchInterval: 30000,
            staleTime: 0,
            // Real-time update handlers
            onUpdate: async ({ transaction }) => {
                // Sync updates back to server
                for (const mutation of transaction.mutations) {
                    if (mutation.type === 'update' && mutation.modified) {
                        console.log(
                            'Syncing node update to server:',
                            mutation.key
                        )
                        // Here you'd call updateNode API
                    }
                }
            },
        })
    )
}

// Individual Publisher Collection Factory
export const createSinglePublisherCollection = (publisherId: string) => {
    return createCollection(
        queryCollectionOptions<Publisher>({
            queryKey: ['publisher', publisherId],
            queryFn: async () => {
                const publisher = await getPublisher(publisherId)
                return publisher ? [publisher] : []
            },
            queryClient: getQueryClient(),
            getKey: (publisher) => publisher.id || '',
            refetchInterval: 60000,
            staleTime: 0,
        })
    )
}

// Export types for the collections
export type NodesCollection = ReturnType<typeof getNodesCollection>
export type PublishersCollection = ReturnType<typeof getPublishersCollection>
