// Using React hooks for live queries
import { useState, useEffect } from 'react'
import { getDB, getCollections } from './client'
import type { Node, Publisher, NodeVersion, AccessToken } from './schema'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

// Custom hooks for working with TanStack DB collections

// Node hooks
export function useNodesLive(options?: {
    where?: Partial<Node>
    orderBy?: keyof Node
    limit?: number
}) {
    const [nodes, setNodes] = useState<Node[]>([])

    useEffect(() => {
        const db = getDB()
        const result = db.collections.nodes.findMany(options)

        if (options?.orderBy && Array.isArray(result)) {
            result.sort((a, b) => {
                const aVal = a[options.orderBy as keyof Node]
                const bVal = b[options.orderBy as keyof Node]
                if (aVal === undefined || bVal === undefined) return 0
                if (aVal > bVal) return -1
                if (aVal < bVal) return 1
                return 0
            })
        }

        setNodes(result)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(options)])

    return nodes
}

export function useNodeLive(nodeId: string) {
    const [node, setNode] = useState<Node | null>(null)

    useEffect(() => {
        const db = getDB()
        const result = db.collections.nodes.findOne({ where: { id: nodeId } })
        setNode(result)
    }, [nodeId])

    return node
}

export function useNodesByPublisherLive(publisherId: string) {
    const [nodes, setNodes] = useState<Node[]>([])

    useEffect(() => {
        const db = getDB()
        const result = db.collections.nodes.findMany({
            where: { publisher_id: publisherId },
        })

        // Sort by updated_at desc
        if (Array.isArray(result)) {
            result.sort((a, b) => {
                const aDate = new Date(a.updated_at).getTime()
                const bDate = new Date(b.updated_at).getTime()
                return bDate - aDate
            })
        }

        setNodes(result)
    }, [publisherId])

    return nodes
}

// Publisher hooks
export function usePublishersLive(options?: {
    where?: Partial<Publisher>
    orderBy?: keyof Publisher
    limit?: number
}) {
    const [publishers, setPublishers] = useState<Publisher[]>([])

    useEffect(() => {
        const db = getDB()
        const result = db.collections.publishers.findMany(options)

        if (options?.orderBy && Array.isArray(result)) {
            result.sort((a, b) => {
                const aVal = a[options.orderBy as keyof Publisher]
                const bVal = b[options.orderBy as keyof Publisher]
                if (aVal === undefined || bVal === undefined) return 0
                if (aVal > bVal) return -1
                if (aVal < bVal) return 1
                return 0
            })
        }

        setPublishers(result)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(options)])

    return publishers
}

export function usePublisherLive(publisherId: string) {
    const [publisher, setPublisher] = useState<Publisher | null>(null)

    useEffect(() => {
        const db = getDB()
        const result = db.collections.publishers.findOne({
            where: { id: publisherId },
        })
        setPublisher(result)
    }, [publisherId])

    return publisher
}

// Node Version hooks
export function useNodeVersionsLive(nodeId: string) {
    const [versions, setVersions] = useState<NodeVersion[]>([])

    useEffect(() => {
        const db = getDB()
        const result = db.collections.nodeVersions.findMany({
            where: { node_id: nodeId },
        })

        // Sort by created_at desc
        if (Array.isArray(result)) {
            result.sort((a, b) => {
                const aDate = new Date(a.created_at).getTime()
                const bDate = new Date(b.created_at).getTime()
                return bDate - aDate
            })
        }

        setVersions(result)
    }, [nodeId])

    return versions
}

// Access Token hooks
export function useAccessTokensLive(publisherId: string) {
    const [tokens, setTokens] = useState<AccessToken[]>([])

    useEffect(() => {
        const db = getDB()
        const result = db.collections.accessTokens.findMany({
            where: { publisher_id: publisherId, is_active: true },
        })

        // Sort by created_at desc
        if (Array.isArray(result)) {
            result.sort((a, b) => {
                const aDate = new Date(a.created_at).getTime()
                const bDate = new Date(b.created_at).getTime()
                return bDate - aDate
            })
        }

        setTokens(result)
    }, [publisherId])

    return tokens
}

// Mutation hooks with optimistic updates
export function useNodeMutation() {
    const db = getDB()
    const queryClient = useQueryClient()

    const createNode = useCallback(
        async (node: Omit<Node, 'id' | 'created_at' | 'updated_at'>) => {
            const newNode: Node = {
                ...node,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            // Optimistically update the DB
            await db.collections.nodes.create(newNode)

            // Invalidate React Query cache if needed
            queryClient.invalidateQueries({ queryKey: ['/nodes'] })

            return newNode
        },
        [db, queryClient]
    )

    const updateNode = useCallback(
        async (id: string, updates: Partial<Node>) => {
            const updatedNode = {
                ...updates,
                updated_at: new Date().toISOString(),
            }

            await db.collections.nodes.update({
                where: { id },
                data: updatedNode,
            })

            queryClient.invalidateQueries({ queryKey: ['/nodes', id] })

            return updatedNode
        },
        [db, queryClient]
    )

    const deleteNode = useCallback(
        async (id: string) => {
            await db.collections.nodes.delete({ where: { id } })
            queryClient.invalidateQueries({ queryKey: ['/nodes'] })
        },
        [db, queryClient]
    )

    return { createNode, updateNode, deleteNode }
}

export function usePublisherMutation() {
    const db = getDB()
    const queryClient = useQueryClient()

    const createPublisher = useCallback(
        async (
            publisher: Omit<Publisher, 'id' | 'created_at' | 'updated_at'>
        ) => {
            const newPublisher: Publisher = {
                ...publisher,
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            await db.collections.publishers.create(newPublisher)
            queryClient.invalidateQueries({ queryKey: ['/publishers'] })

            return newPublisher
        },
        [db, queryClient]
    )

    const updatePublisher = useCallback(
        async (id: string, updates: Partial<Publisher>) => {
            const updatedPublisher = {
                ...updates,
                updated_at: new Date().toISOString(),
            }

            await db.collections.publishers.update({
                where: { id },
                data: updatedPublisher,
            })

            queryClient.invalidateQueries({ queryKey: ['/publishers', id] })

            return updatedPublisher
        },
        [db, queryClient]
    )

    const deletePublisher = useCallback(
        async (id: string) => {
            await db.collections.publishers.delete({ where: { id } })
            queryClient.invalidateQueries({ queryKey: ['/publishers'] })
        },
        [db, queryClient]
    )

    return { createPublisher, updatePublisher, deletePublisher }
}

// Sync helper to populate DB from API responses
export async function syncNodeToDb(apiNode: any): Promise<Node> {
    const collections = getCollections()
    const node: Node = {
        id: apiNode.id,
        name: apiNode.name,
        description: apiNode.description || '',
        author: apiNode.author || '',
        license: apiNode.license || '',
        repository: apiNode.repository || '',
        tags: apiNode.tags || [],
        latest_version: apiNode.latest_version || '',
        total_downloads: apiNode.total_downloads || 0,
        rating: apiNode.rating || 0,
        rating_count: apiNode.rating_count || 0,
        publisher_id: apiNode.publisher_id || '',
        created_at: apiNode.created_at,
        updated_at: apiNode.updated_at,
        deprecated: apiNode.deprecated || false,
        icon: apiNode.icon || '',
    }

    await collections.nodes.upsert({
        where: { id: node.id },
        create: node,
        update: node,
    })

    return node
}

export async function syncPublisherToDb(apiPublisher: any): Promise<Publisher> {
    const collections = getCollections()
    const publisher: Publisher = {
        id: apiPublisher.id,
        name: apiPublisher.name,
        display_name: apiPublisher.display_name || apiPublisher.name,
        description: apiPublisher.description || '',
        website: apiPublisher.website || '',
        github_organization_name: apiPublisher.github_organization_name || '',
        created_at: apiPublisher.created_at,
        updated_at: apiPublisher.updated_at,
        logo: apiPublisher.logo || '',
        member_count: apiPublisher.member_count || 0,
        node_count: apiPublisher.node_count || 0,
    }

    await collections.publishers.upsert({
        where: { id: publisher.id },
        create: publisher,
        update: publisher,
    })

    return publisher
}

export async function syncNodeVersionToDb(
    apiVersion: any
): Promise<NodeVersion> {
    const collections = getCollections()
    const version: NodeVersion = {
        id: apiVersion.id,
        node_id: apiVersion.node_id,
        version: apiVersion.version,
        changelog: apiVersion.changelog || '',
        dependencies: apiVersion.dependencies || {},
        download_url: apiVersion.download_url || '',
        comfyui_versions: apiVersion.comfyui_versions || [],
        created_at: apiVersion.created_at,
        updated_at: apiVersion.updated_at,
        deprecated: apiVersion.deprecated || false,
        downloads: apiVersion.downloads || 0,
    }

    await collections.nodeVersions.upsert({
        where: { id: version.id },
        create: version,
        update: version,
    })

    return version
}
