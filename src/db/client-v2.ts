import { createDatabase } from '@tanstack/db'
import { useQueryClient } from '@tanstack/react-query'
import { createAPIBackedCollections } from './collections'
import type { APICollections } from './collections'

// Database interface for the ComfyUI Registry
interface ComfyRegistryDB {
    collections: APICollections
    // Add database-level methods
    clearAll: () => void
    hydrate: () => Promise<void>
}

// Create the TanStack DB database instance
export function createComfyDB(queryClient: any): ComfyRegistryDB {
    // Create the API-backed collections
    const collections = createAPIBackedCollections(queryClient)

    // Create the database with collections
    const db = createDatabase({
        collections: {
            nodes: collections.nodesCollection,
            publishers: collections.publishersCollection,
        },
        // Database-level configuration
        debug: process.env.NODE_ENV === 'development',
    })

    return {
        collections,
        clearAll: () => {
            // Clear all collections
            collections.nodesCollection.clear()
            collections.publishersCollection.clear()
        },
        hydrate: async () => {
            // Hydrate from persisted state if needed
            // TanStack DB handles this automatically with the query client
            console.log('ComfyDB hydrated')
        },
    }
}

// Singleton instance
let dbInstance: ComfyRegistryDB | null = null

export function getComfyDB(): ComfyRegistryDB {
    if (!dbInstance) {
        throw new Error('ComfyDB not initialized. Call initComfyDB first.')
    }
    return dbInstance
}

export function initComfyDB(queryClient: any): ComfyRegistryDB {
    if (!dbInstance) {
        dbInstance = createComfyDB(queryClient)
    }
    return dbInstance
}

// Export the database type
export type ComfyDB = ComfyRegistryDB
