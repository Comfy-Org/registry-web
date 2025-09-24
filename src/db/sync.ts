import { getCollections } from './client'
import { syncNodeToDb, syncPublisherToDb, syncNodeVersionToDb } from './hooks'
import type { Node, Publisher, NodeVersion } from './schema'

// Sync utilities to integrate TanStack DB with existing API responses

/**
 * Sync API response data to TanStack DB
 * This allows us to gradually migrate while keeping both systems in sync
 */
export class DBSyncManager {
    private static instance: DBSyncManager

    static getInstance(): DBSyncManager {
        if (!DBSyncManager.instance) {
            DBSyncManager.instance = new DBSyncManager()
        }
        return DBSyncManager.instance
    }

    /**
     * Sync nodes from API response to DB
     */
    async syncNodes(apiNodes: any[]): Promise<Node[]> {
        if (!apiNodes || !Array.isArray(apiNodes)) return []

        const syncedNodes = await Promise.all(
            apiNodes.map((node) => syncNodeToDb(node))
        )

        return syncedNodes
    }

    /**
     * Sync a single node from API response
     */
    async syncNode(apiNode: any): Promise<Node | null> {
        if (!apiNode) return null
        return syncNodeToDb(apiNode)
    }

    /**
     * Sync publishers from API response to DB
     */
    async syncPublishers(apiPublishers: any[]): Promise<Publisher[]> {
        if (!apiPublishers || !Array.isArray(apiPublishers)) return []

        const syncedPublishers = await Promise.all(
            apiPublishers.map((publisher) => syncPublisherToDb(publisher))
        )

        return syncedPublishers
    }

    /**
     * Sync a single publisher from API response
     */
    async syncPublisher(apiPublisher: any): Promise<Publisher | null> {
        if (!apiPublisher) return null
        return syncPublisherToDb(apiPublisher)
    }

    /**
     * Sync node versions from API response to DB
     */
    async syncNodeVersions(apiVersions: any[]): Promise<NodeVersion[]> {
        if (!apiVersions || !Array.isArray(apiVersions)) return []

        const syncedVersions = await Promise.all(
            apiVersions.map((version) => syncNodeVersionToDb(version))
        )

        return syncedVersions
    }

    /**
     * Clear all data from a collection
     */
    async clearCollection(
        collectionName: keyof ReturnType<typeof getCollections>
    ) {
        const collections = getCollections()
        await collections[collectionName].clear()
    }

    /**
     * Clear all data from all collections
     */
    async clearAllCollections() {
        const collections = getCollections()
        await Promise.all([
            collections.nodes.clear(),
            collections.publishers.clear(),
            collections.nodeVersions.clear(),
            collections.accessTokens.clear(),
            collections.auditLogs.clear(),
            collections.userActivity.clear(),
        ])
    }

    /**
     * Track user activity
     */
    async trackActivity(
        userId: string,
        actionType: 'view' | 'download' | 'rate' | 'favorite' | 'install',
        entityId?: string,
        entityType?: 'node' | 'publisher',
        metadata?: Record<string, any>
    ) {
        const collections = getCollections()
        const activity = {
            id: crypto.randomUUID(),
            user_id: userId,
            action_type: actionType,
            node_id: entityType === 'node' ? entityId : undefined,
            publisher_id: entityType === 'publisher' ? entityId : undefined,
            created_at: new Date().toISOString(),
            metadata,
        }

        await collections.userActivity.create(activity)
        return activity
    }

    /**
     * Log audit event
     */
    async logAudit(
        action: string,
        entityType: string,
        entityId?: string,
        userId?: string,
        publisherId?: string,
        metadata?: Record<string, any>
    ) {
        const collections = getCollections()
        const log = {
            id: crypto.randomUUID(),
            user_id: userId,
            publisher_id: publisherId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            metadata,
            created_at: new Date().toISOString(),
            ip_address:
                typeof window !== 'undefined'
                    ? window.location.hostname
                    : undefined,
        }

        await collections.auditLogs.create(log)
        return log
    }
}

// Export a singleton instance for convenience
export const dbSync = DBSyncManager.getInstance()
