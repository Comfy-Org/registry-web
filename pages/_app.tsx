import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import type { AppProps } from 'next/app'
import FlowBiteThemeProvider from '../components/flowbite-theme'
import Layout from '../components/layout'
import '../styles/globals.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                // Don't retry on 404s
                if (error?.response?.status === 404) return false
                // Retry up to 3 times for other errors
                return failureCount < 3
            },
            // Default stale time for all queries (5 minutes)
            staleTime: 5 * 60 * 1000,
        },
    },
})

// Create a persister for syncing queries to localStorage
if (typeof window !== 'undefined') {
    const persister = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'comfy-registry-cache',
    })
    persistQueryClient({
        queryClient: queryClient as any,
        persister: persister,
        // Only persist queries with these query keys
        dehydrateOptions: {
            shouldDehydrateQuery: ({ queryKey }) => {
                // Persist user data (queryKey is ['/users'])
                const persistKeys: Record<string, true> = {
                    '/users': true,
                    '/users/publishers/': true,
                }
                if (persistKeys[String(queryKey[0])]) return true
                return false
            },
        },
    })
}

export default function App({ Component, pageProps }: AppProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <FlowBiteThemeProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </FlowBiteThemeProvider>
        </QueryClientProvider>
    )
}
