import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { DBProvider } from '@tanstack/react-db'
import { useQueryClient } from '@tanstack/react-query'
import { initComfyDB, getComfyDB } from './client-v2'
import type { ComfyDB } from './client-v2'

interface ComfyDBContextValue {
    db: ComfyDB
    isInitialized: boolean
}

const ComfyDBContext = createContext<ComfyDBContextValue | null>(null)

interface ComfyDBProviderProps {
    children: ReactNode
}

export function ComfyDBProvider({ children }: ComfyDBProviderProps) {
    const queryClient = useQueryClient()
    const [isInitialized, setIsInitialized] = React.useState(false)
    const [db, setDb] = React.useState<ComfyDB | null>(null)

    useEffect(() => {
        const initDB = async () => {
            try {
                // Initialize the database with the query client
                const database = initComfyDB(queryClient)

                // Hydrate from persisted state
                await database.hydrate()

                setDb(database)
                setIsInitialized(true)

                console.log('TanStack DB initialized successfully')
            } catch (error) {
                console.error('Failed to initialize TanStack DB:', error)
                setIsInitialized(true) // Continue even if initialization fails
            }
        }

        initDB()
    }, [queryClient])

    if (!db) {
        return <div>Loading database...</div>
    }

    return (
        <ComfyDBContext.Provider value={{ db, isInitialized }}>
            <DBProvider database={db}>{children}</DBProvider>
        </ComfyDBContext.Provider>
    )
}

export function useComfyDB() {
    const context = useContext(ComfyDBContext)
    if (!context) {
        throw new Error('useComfyDB must be used within a ComfyDBProvider')
    }
    return context
}

// Hook to check if DB is ready
export function useDBReady() {
    const { isInitialized } = useComfyDB()
    return isInitialized
}

// Hook to access collections directly
export function useCollections() {
    const { db } = useComfyDB()
    return db.collections
}
