import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { getDB } from './client'
import type { ComfyDB } from './client'

interface ComfyDBContextValue {
    db: ComfyDB
    isInitialized: boolean
}

const ComfyDBContext = createContext<ComfyDBContextValue | null>(null)

interface ComfyDBProviderProps {
    children: ReactNode
}

export function ComfyDBProvider({ children }: ComfyDBProviderProps) {
    const [isInitialized, setIsInitialized] = React.useState(false)
    const db = getDB()

    useEffect(() => {
        // Initialize the database
        const initDB = async () => {
            try {
                // Load any persisted data
                await db.hydrate()
                setIsInitialized(true)
            } catch (error) {
                console.error('Failed to initialize TanStack DB:', error)
                setIsInitialized(true) // Continue even if hydration fails
            }
        }

        initDB()
    }, [db])

    return (
        <ComfyDBContext.Provider value={{ db, isInitialized }}>
            {children}
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
