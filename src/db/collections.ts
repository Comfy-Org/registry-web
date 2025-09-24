import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/react-query'
import type {
    Node,
    Publisher,
    NodeVersion,
    ListAllNodes200,
    GetNode200,
    ListNodeVersionsResponse,
    GetPublisher200,
} from '@/src/api/generated'
import {
    listAllNodes,
    getNode,
    getPublisher,
    listNodeVersions,
} from '@/src/api/generated'

// API-backed collections using TanStack DB with Query Collection Options
export function createAPIBackedCollections(queryClient: QueryClient) {
    // Nodes Collection - fetches from /nodes API
    const nodesCollection = createCollection(
        queryCollectionOptions<Node>({
            queryKey: ['nodes'],
            queryFn: async () => {
                const response = await listAllNodes({ limit: 1000, page: 1 })
                return response.nodes || []
            },
            queryClient,
            getKey: (node) => node.id || '',
            // Enable automatic refetching
            refetchInterval: 30000, // 30 seconds
            staleTime: 0,
            // Persistence handlers for optimistic updates
            onInsert: async ({ transaction }) => {
                // Handle creating new nodes (if API supports it)
                console.log('Inserting nodes:', transaction.mutations.length)
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

    // Publishers Collection - fetches from /publishers API
    const publishersCollection = createCollection(
        queryCollectionOptions<Publisher>({
            queryKey: ['publishers'],
            queryFn: async () => {
                // Note: This would need to be implemented in the API
                // For now, return empty array since listPublishers doesn't exist
                return []
            },
            queryClient,
            getKey: (publisher) => publisher.id || '',
            refetchInterval: 60000, // 1 minute
            staleTime: 0,
        })
    )

    // Node Versions Collection Factory - creates collections per node
    const createNodeVersionsCollection = (nodeId: string) => {
        return createCollection(
            queryCollectionOptions<NodeVersion>({
                queryKey: ['node-versions', nodeId],
                queryFn: async () => {
                    const response = await listNodeVersions(nodeId, {
                        statuses: ['NodeVersionStatusActive' as any],
                    })
                    return response || []
                },
                queryClient,
                getKey: (version) => version.id || '',
                refetchInterval: 30000,
                staleTime: 0,
            })
        )
    }

    // Individual Node Collection Factory - for single node queries
    const createSingleNodeCollection = (nodeId: string) => {
        return createCollection(
            queryCollectionOptions<Node>({
                queryKey: ['node', nodeId],
                queryFn: async () => {
                    const node = await getNode(nodeId)
                    return node ? [node] : []
                },
                queryClient,
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
    const createSinglePublisherCollection = (publisherId: string) => {
        return createCollection(
            queryCollectionOptions<Publisher>({
                queryKey: ['publisher', publisherId],
                queryFn: async () => {
                    const publisher = await getPublisher(publisherId)
                    return publisher ? [publisher] : []
                },
                queryClient,
                getKey: (publisher) => publisher.id || '',
                refetchInterval: 60000,
                staleTime: 0,
            })
        )
    }

    return {
        nodesCollection,
        publishersCollection,
        createNodeVersionsCollection,
        createSingleNodeCollection,
        createSinglePublisherCollection,
    }
}

// Export types for the collections
export type APICollections = ReturnType<typeof createAPIBackedCollections>
export type NodesCollection = APICollections['nodesCollection']
export type PublishersCollection = APICollections['publishersCollection']
