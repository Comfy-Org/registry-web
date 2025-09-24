import React, { useEffect, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setQueryClient } from './collections'

interface ComfyDBProviderProps {
    children: ReactNode
}

// Simple provider that initializes the query client for collections
export function ComfyDBProvider({ children }: ComfyDBProviderProps) {
    const queryClient = useQueryClient()

    useEffect(() => {
        // Set the query client for collections to use
        setQueryClient(queryClient)
        console.log('TanStack DB collections initialized with QueryClient')
    }, [queryClient])

    // No loading state needed - collections work directly
    return <>{children}</>
}

// Backwards compatibility hooks (now just return static values)
export function useComfyDB() {
    return {
        isInitialized: true,
        collections: {
            // These are now available as direct imports
        },
    }
}

export function useDBReady() {
    return true
}

export function useCollections() {
    return {
        // Collections are now direct imports, not accessed through context
        // Components should import them directly from './collections'
    }
}
