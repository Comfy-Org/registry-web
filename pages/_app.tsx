import { AXIOS_INSTANCE } from '@/src/api/mutator/axios-instance'
import app from '@/src/firebase'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { getAuth } from 'firebase/auth'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import FlowBiteThemeProvider from '../components/flowbite-theme'
import Layout from '../components/layout'
import '../styles/globals.css'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import { request } from 'http'
import { DIE } from 'phpdie'
import { ComfyDBProvider } from '@/src/db/provider-v2'
import { setupDBSyncInterceptor } from '@/src/db/interceptor'

// Setup TanStack DB sync interceptor
if (typeof window !== 'undefined') {
    setupDBSyncInterceptor()
}

// Add an interceptor to attach the Firebase JWT token to every request
// Put in _app.tsx because this only works in react-dom environment
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
    const auth = getAuth(app)
    const user = auth.currentUser
    if (user) {
        const token = await user.getIdToken()
        sessionStorage.setItem('idToken', token)
        config.headers.Authorization = `Bearer ${token}`
    } else {
        const cachedIdtoken = sessionStorage.getItem('idToken') ?? ''
        if (cachedIdtoken)
            config.headers.Authorization = `Bearer ${cachedIdtoken}`
    }
    return config
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error: any) => {
                // Don't retry on 404s
                if (error?.response?.status === 404) return false

                // Retry up to 3 times for other errors
                return failureCount < 3
            },
            staleTime: 0, // set to 0 to always query fresh data when page refreshed, and render staled data while requesting (swr)
            gcTime: 86400e3,
        },
    },
})

// General localStorage cache invalidation for all endpoints
// this interceptors will user always have latest data after edit.
AXIOS_INSTANCE.interceptors.response.use(
    function onSuccess(response: AxiosResponse) {
        const req = response.config
        if (!req.url) return response

        const baseURL =
            req.baseURL ??
            globalThis.location.origin ??
            DIE('Remember to fill window.location when testing axios')
        const pathname = new URL(req.url, baseURL).pathname

        const isCreateMethod = ['POST'].includes(
            req.method!.toUpperCase() ?? ''
        )
        const isEditMethod = ['PUT', 'PATCH', 'DELETE'].includes(
            req.method!.toUpperCase() ?? ''
        )

        if (isCreateMethod) {
            queryClient.invalidateQueries({ queryKey: [pathname] })
        }
        if (isEditMethod) {
            queryClient.invalidateQueries({ queryKey: [pathname] })
            queryClient.invalidateQueries({
                queryKey: [pathname.split('/').slice(0, -1).join('/')],
            })
        }
        return response
    },
    (error) => {
        return Promise.reject(error)
    }
)

const persistEffect = () => {
    // - [persistQueryClient \| TanStack Query React Docs]( https://tanstack.com/query/v4/docs/framework/react/plugins/persistQueryClient )
    const [unsubscribe] = persistQueryClient({
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

                // Persist all queries in localStorage, share across tabs
                return true
            },
        },
        maxAge: 86400e3, // 1 day in seconds

        // - **`NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA`:** This environment variable, provided by Vercel, contains the unique commit SHA of the current deployment. It's used as the `buster` value to ensure that asset URLs change with every deployment, prompting browsers to fetch fresh copies.
        // - **Fallback to `'v1'`:** In cases where the commit SHA is not available (such as local development or unlinked environments), we default to `'v1'`. While this keeps the system functional, be aware that it may not effectively force cache invalidation after changes.
        buster: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'v1',
    })
    return unsubscribe
}

function MyApp({ Component, pageProps }: AppProps) {
    useEffect(persistEffect, [])

    return (
        <QueryClientProvider client={queryClient}>
            <ComfyDBProvider>
                <FlowBiteThemeProvider>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </FlowBiteThemeProvider>
            </ComfyDBProvider>
        </QueryClientProvider>
    )
}

export default MyApp
