// TanStack DB types - using basic implementation for now
// Full TanStack DB implementation requires additional setup
export interface Collection<T> {
    findMany: (options?: any) => T[]
    findOne: (options?: any) => T | null
    create: (data: T) => Promise<T>
    update: (options: any) => Promise<T>
    upsert: (options: any) => Promise<T>
    delete: (options: any) => Promise<void>
    clear: () => Promise<void>
}

export interface DB<T> {
    collections: T
    hydrate: () => Promise<void>
}

interface DBConfig<T> {
    collections: any
    persist?: any
    optimistic?: boolean
}
import {
    Node,
    Publisher,
    NodeVersion,
    AccessToken,
    AuditLog,
    UserActivity,
    NodeSchema,
    PublisherSchema,
    NodeVersionSchema,
    AccessTokenSchema,
    AuditLogSchema,
    UserActivitySchema,
} from './schema'

// Define our database schema
interface ComfyDBSchema {
    nodes: Collection<Node>
    publishers: Collection<Publisher>
    nodeVersions: Collection<NodeVersion>
    accessTokens: Collection<AccessToken>
    auditLogs: Collection<AuditLog>
    userActivity: Collection<UserActivity>
}

// Create the database configuration
const dbConfig: DBConfig<ComfyDBSchema> = {
    collections: {
        nodes: {
            schema: NodeSchema,
            indexes: [
                ['name'],
                ['publisher_id'],
                ['created_at'],
                ['total_downloads'],
                ['rating'],
            ],
        },
        publishers: {
            schema: PublisherSchema,
            indexes: [['name'], ['created_at'], ['node_count']],
        },
        nodeVersions: {
            schema: NodeVersionSchema,
            indexes: [['node_id'], ['version'], ['created_at']],
        },
        accessTokens: {
            schema: AccessTokenSchema,
            indexes: [['publisher_id'], ['created_at']],
        },
        auditLogs: {
            schema: AuditLogSchema,
            indexes: [
                ['user_id'],
                ['publisher_id'],
                ['entity_type'],
                ['created_at'],
            ],
        },
        userActivity: {
            schema: UserActivitySchema,
            indexes: [
                ['user_id'],
                ['node_id'],
                ['publisher_id'],
                ['action_type'],
                ['created_at'],
            ],
        },
    },
    // Enable persistence to localStorage
    persist: {
        enabled: true,
        strategy: 'localStorage',
        key: 'comfy-registry-db',
    },
    // Enable optimistic updates
    optimistic: true,
}

// Create the database instance with in-memory implementation
class InMemoryDB implements DB<ComfyDBSchema> {
    collections: ComfyDBSchema
    private data: Map<string, any[]> = new Map()

    constructor() {
        this.collections = {
            nodes: this.createCollection('nodes'),
            publishers: this.createCollection('publishers'),
            nodeVersions: this.createCollection('nodeVersions'),
            accessTokens: this.createCollection('accessTokens'),
            auditLogs: this.createCollection('auditLogs'),
            userActivity: this.createCollection('userActivity'),
        }
    }

    private createCollection<T>(name: string): Collection<T> {
        if (!this.data.has(name)) {
            this.data.set(name, [])
        }

        return {
            findMany: (options?: any) => {
                const items = this.data.get(name) || []
                if (options?.where) {
                    return items.filter((item) => {
                        return Object.entries(options.where).every(
                            ([key, value]) => item[key] === value
                        )
                    })
                }
                if (options?.limit) {
                    return items.slice(0, options.limit)
                }
                return items
            },
            findOne: (options?: any) => {
                const items = this.data.get(name) || []
                if (options?.where) {
                    return (
                        items.find((item) => {
                            return Object.entries(options.where).every(
                                ([key, value]) => item[key] === value
                            )
                        }) || null
                    )
                }
                return items[0] || null
            },
            create: async (data: T) => {
                const items = this.data.get(name) || []
                items.push(data)
                this.data.set(name, items)
                this.persist()
                return data
            },
            update: async (options: any) => {
                const items = this.data.get(name) || []
                const index = items.findIndex((item) => {
                    return Object.entries(options.where).every(
                        ([key, value]) => item[key] === value
                    )
                })
                if (index !== -1) {
                    items[index] = { ...items[index], ...options.data }
                    this.data.set(name, items)
                    this.persist()
                }
                return items[index]
            },
            upsert: async (options: any) => {
                const items = this.data.get(name) || []
                const index = items.findIndex((item) => {
                    return Object.entries(options.where).every(
                        ([key, value]) => item[key] === value
                    )
                })
                if (index !== -1) {
                    items[index] = { ...items[index], ...options.update }
                } else {
                    items.push(options.create)
                }
                this.data.set(name, items)
                this.persist()
                return items[index] || options.create
            },
            delete: async (options: any) => {
                const items = this.data.get(name) || []
                const filtered = items.filter((item) => {
                    return !Object.entries(options.where).every(
                        ([key, value]) => item[key] === value
                    )
                })
                this.data.set(name, filtered)
                this.persist()
            },
            clear: async () => {
                this.data.set(name, [])
                this.persist()
            },
        }
    }

    async hydrate() {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('comfy-registry-db')
            if (stored) {
                try {
                    const parsed = JSON.parse(stored)
                    Object.entries(parsed).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            this.data.set(key, value)
                        }
                    })
                } catch (e) {
                    console.error('Failed to hydrate DB from localStorage', e)
                }
            }
        }
    }

    private persist() {
        if (typeof window !== 'undefined') {
            const toStore: Record<string, any[]> = {}
            this.data.forEach((value, key) => {
                toStore[key] = value
            })
            localStorage.setItem('comfy-registry-db', JSON.stringify(toStore))
        }
    }
}

// Create the database instance
let dbInstance: DB<ComfyDBSchema> | null = null

export function getDB(): DB<ComfyDBSchema> {
    if (!dbInstance) {
        dbInstance = new InMemoryDB()
    }
    return dbInstance
}

// Export typed collections for direct access
export function getCollections() {
    const db = getDB()
    return {
        nodes: db.collections.nodes,
        publishers: db.collections.publishers,
        nodeVersions: db.collections.nodeVersions,
        accessTokens: db.collections.accessTokens,
        auditLogs: db.collections.auditLogs,
        userActivity: db.collections.userActivity,
    }
}

// Export the database type for use in other files
export type ComfyDB = DB<ComfyDBSchema>
