import { AXIOS_INSTANCE } from '@/src/api/mutator/axios-instance'
import { dbSync } from './sync'
import type { AxiosResponse } from 'axios'

/**
 * Add TanStack DB sync interceptor to automatically sync API responses to the local DB
 * This allows gradual migration while keeping both systems in sync
 */
export function setupDBSyncInterceptor() {
    // Response interceptor to sync data to TanStack DB
    AXIOS_INSTANCE.interceptors.response.use(
        async (response: AxiosResponse) => {
            try {
                const { config, data } = response
                if (!config.url) return response

                const pathname = new URL(config.url, config.baseURL || '')
                    .pathname

                // Sync nodes endpoints
                if (pathname.includes('/nodes')) {
                    if (pathname.match(/^\/nodes$/)) {
                        // List nodes
                        if (data?.data && Array.isArray(data.data)) {
                            await dbSync.syncNodes(data.data)
                            console.log(
                                `[DB Sync] Synced ${data.data.length} nodes`
                            )
                        }
                    } else if (pathname.match(/^\/nodes\/[^\/]+$/)) {
                        // Single node
                        if (data) {
                            await dbSync.syncNode(data)
                            console.log(`[DB Sync] Synced node: ${data.name}`)
                        }
                    }
                }

                // Sync publishers endpoints
                if (pathname.includes('/publishers')) {
                    if (pathname.match(/^\/publishers$/)) {
                        // List publishers
                        if (data?.data && Array.isArray(data.data)) {
                            await dbSync.syncPublishers(data.data)
                            console.log(
                                `[DB Sync] Synced ${data.data.length} publishers`
                            )
                        }
                    } else if (pathname.match(/^\/publishers\/[^\/]+$/)) {
                        // Single publisher
                        if (data) {
                            await dbSync.syncPublisher(data)
                            console.log(
                                `[DB Sync] Synced publisher: ${data.name}`
                            )
                        }
                    }
                }

                // Sync node versions
                if (pathname.includes('/node_versions')) {
                    if (data?.data && Array.isArray(data.data)) {
                        await dbSync.syncNodeVersions(data.data)
                        console.log(
                            `[DB Sync] Synced ${data.data.length} node versions`
                        )
                    }
                }

                // Log audit events for mutations
                const method = config.method?.toUpperCase()
                const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
                    method || ''
                )

                if (isMutation) {
                    const userId = sessionStorage.getItem('userId')
                    const entityType = pathname.split('/')[1] // Get entity type from path
                    const entityId = pathname.split('/')[2] // Get entity ID if available

                    await dbSync.logAudit(
                        `${method} ${entityType}`,
                        entityType,
                        entityId,
                        userId || undefined,
                        undefined,
                        {
                            url: pathname,
                            method,
                            timestamp: Date.now(),
                            responseStatus: response.status,
                        }
                    )
                }
            } catch (error) {
                // Don't break the response chain if DB sync fails
                console.error('[DB Sync] Error syncing data:', error)
            }

            return response
        },
        (error) => {
            // Pass through errors unchanged
            return Promise.reject(error)
        }
    )
}
