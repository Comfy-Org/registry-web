import { useLiveQuery } from '@tanstack/react-db'
import { useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getComfyDB } from './client-v2'
import type { Node, Publisher, NodeVersion } from '@/src/api/generated'

// Enhanced hooks using TanStack DB live queries

// Live Nodes Queries
export function useNodesLive(options?: {
    where?: Partial<Node>
    orderBy?: keyof Node
    limit?: number
    search?: string
}) {
    const db = getComfyDB()

    return useLiveQuery(
        (q) => {
            let query = q.from({ nodes: db.collections.nodesCollection })

            // Apply filters
            if (options?.where) {
                Object.entries(options.where).forEach(([key, value]) => {
                    if (value !== undefined) {
                        query = query.where(
                            ({ nodes }) => (nodes as any)[key] === value
                        )
                    }
                })
            }

            // Apply search filter
            if (options?.search) {
                const searchLower = options.search.toLowerCase()
                query = query.where(
                    ({ nodes }) =>
                        nodes.name?.toLowerCase().includes(searchLower) ||
                        nodes.description
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        nodes.author?.toLowerCase().includes(searchLower)
                )
            }

            // Apply sorting
            if (options?.orderBy) {
                query = query.orderBy(
                    ({ nodes }) => (nodes as any)[options.orderBy],
                    'desc'
                )
            }

            // Apply limit
            if (options?.limit) {
                query = query.limit(options.limit)
            }

            return query.select(({ nodes }) => nodes)
        },
        [options?.where, options?.orderBy, options?.limit, options?.search]
    )
}

// Live query for a single node
export function useNodeLive(nodeId: string) {
    const db = getComfyDB()
    const queryClient = useQueryClient()

    // Create a single node collection for this specific node
    const singleNodeCollection = useMemo(() => {
        if (!nodeId) return null
        return db.collections.createSingleNodeCollection(nodeId)
    }, [nodeId, db.collections])

    return useLiveQuery(
        (q) => {
            if (!singleNodeCollection) return null

            return q
                .from({ node: singleNodeCollection })
                .where(({ node }) => node.id === nodeId)
                .select(({ node }) => node)
                .first()
        },
        [nodeId, singleNodeCollection]
    )
}

// Live query for nodes by publisher
export function useNodesByPublisherLive(publisherId: string) {
    const db = getComfyDB()

    return useLiveQuery(
        (q) => {
            return q
                .from({ nodes: db.collections.nodesCollection })
                .where(({ nodes }) => nodes.publisher?.id === publisherId)
                .orderBy(({ nodes }) => nodes.created_at, 'desc')
                .select(({ nodes }) => nodes)
        },
        [publisherId]
    )
}

// Live Publishers Queries
export function usePublishersLive(options?: {
    where?: Partial<Publisher>
    orderBy?: keyof Publisher
    limit?: number
}) {
    const db = getComfyDB()

    return useLiveQuery(
        (q) => {
            let query = q.from({
                publishers: db.collections.publishersCollection,
            })

            // Apply filters
            if (options?.where) {
                Object.entries(options.where).forEach(([key, value]) => {
                    if (value !== undefined) {
                        query = query.where(
                            ({ publishers }) =>
                                (publishers as any)[key] === value
                        )
                    }
                })
            }

            // Apply sorting
            if (options?.orderBy) {
                query = query.orderBy(
                    ({ publishers }) => (publishers as any)[options.orderBy],
                    'desc'
                )
            }

            // Apply limit
            if (options?.limit) {
                query = query.limit(options.limit)
            }

            return query.select(({ publishers }) => publishers)
        },
        [options?.where, options?.orderBy, options?.limit]
    )
}

// Live query for a single publisher
export function usePublisherLive(publisherId: string) {
    const db = getComfyDB()

    const singlePublisherCollection = useMemo(() => {
        if (!publisherId) return null
        return db.collections.createSinglePublisherCollection(publisherId)
    }, [publisherId, db.collections])

    return useLiveQuery(
        (q) => {
            if (!singlePublisherCollection) return null

            return q
                .from({ publisher: singlePublisherCollection })
                .where(({ publisher }) => publisher.id === publisherId)
                .select(({ publisher }) => publisher)
                .first()
        },
        [publisherId, singlePublisherCollection]
    )
}

// Live Node Versions Queries
export function useNodeVersionsLive(nodeId: string) {
    const db = getComfyDB()

    const versionsCollection = useMemo(() => {
        if (!nodeId) return null
        return db.collections.createNodeVersionsCollection(nodeId)
    }, [nodeId, db.collections])

    return useLiveQuery(
        (q) => {
            if (!versionsCollection) return []

            return q
                .from({ versions: versionsCollection })
                .orderBy(({ versions }) => versions.createdAt, 'desc')
                .select(({ versions }) => versions)
        },
        [nodeId, versionsCollection]
    )
}

// Optimistic Mutation Hooks
export function useNodeMutations() {
    const db = getComfyDB()
    const queryClient = useQueryClient()

    const updateNode = async (nodeId: string, updates: Partial<Node>) => {
        // Optimistic update - immediately update the local data
        db.collections.nodesCollection.update(nodeId, {
            ...updates,
            // Add timestamp for updated_at if API supports it
        })

        // The collection's onUpdate handler will sync to server
        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['node', nodeId] })
    }

    const incrementDownloads = async (nodeId: string) => {
        // Find the current node
        const currentNode = db.collections.nodesCollection.getById(nodeId)
        if (currentNode) {
            await updateNode(nodeId, {
                downloads: (currentNode.downloads || 0) + 1,
            })
        }
    }

    return {
        updateNode,
        incrementDownloads,
    }
}

// Search and filtering hooks
export function useNodesSearch(
    searchQuery: string,
    filters?: {
        category?: string
        deprecated?: boolean
        minRating?: number
    }
) {
    const db = getComfyDB()

    return useLiveQuery(
        (q) => {
            let query = q.from({ nodes: db.collections.nodesCollection })

            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase()
                query = query.where(
                    ({ nodes }) =>
                        nodes.name?.toLowerCase().includes(searchLower) ||
                        nodes.description
                            ?.toLowerCase()
                            .includes(searchLower) ||
                        nodes.author?.toLowerCase().includes(searchLower)
                )
            }

            // Category filter
            if (filters?.category) {
                query = query.where(
                    ({ nodes }) => nodes.category === filters.category
                )
            }

            // Deprecated filter
            if (filters?.deprecated !== undefined) {
                query = query.where(
                    ({ nodes }) =>
                        !!nodes.latest_version?.deprecated ===
                        filters.deprecated
                )
            }

            // Rating filter
            if (filters?.minRating) {
                query = query.where(
                    ({ nodes }) => (nodes.rating || 0) >= filters.minRating!
                )
            }

            return query
                .orderBy(({ nodes }) => nodes.rating, 'desc')
                .select(({ nodes }) => nodes)
        },
        [
            searchQuery,
            filters?.category,
            filters?.deprecated,
            filters?.minRating,
        ]
    )
}

// Analytics hooks
export function useNodeStats() {
    const db = getComfyDB()

    return useLiveQuery((q) => {
        const nodes = q
            .from({ nodes: db.collections.nodesCollection })
            .select(({ nodes }) => nodes)

        return {
            totalNodes: nodes.length,
            totalDownloads: nodes.reduce(
                (sum, node) => sum + (node.downloads || 0),
                0
            ),
            avgRating:
                nodes.reduce((sum, node) => sum + (node.rating || 0), 0) /
                    nodes.length || 0,
            activeNodes: nodes.filter(
                (node) => !node.latest_version?.deprecated
            ).length,
        }
    }, [])
}
