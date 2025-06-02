import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
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
        },
    },
})

const persistEffect = () =>
    persistQueryClient({
        queryClient: queryClient as any,
        persister: createSyncStoragePersister({
            storage: window.localStorage,
            key: 'comfy-registry-cache',
        }),
        // Only persist queries with these query keys
        dehydrateOptions: {
            shouldDehydrateQuery: ({ queryKey, state }) => {
                // Don't persist pending queries as they can't be properly restored
                if (state.status === 'pending') return false

                // Persist user data (queryKey is ['/users'])
                // const persistKeys: Record<string, true> = {
                //     '/users': true,
                //     '/users/publishers/': true,
                // }
                // if (persistKeys[String(queryKey[0])]) return true

                // Persist all queries with 'nodes' in the key for future
                return true
            },
        },
        maxAge: 86400e3, // 1 day in seconds
        buster: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'v1', // build versioning to clear cache when needed
    })[0]

export default function App({ Component, pageProps }: AppProps) {
    useEffect(persistEffect, [])
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
