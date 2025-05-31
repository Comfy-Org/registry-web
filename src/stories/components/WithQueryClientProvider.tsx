import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Create a client with default settings for Storybook
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity, // Prevent refetching during Storybook usage
        },
    },
})

/**
 * A wrapper component that provides React Query context for Storybook components
 * Use this for any component that uses React Query hooks
 */
export const WithQueryClientProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
