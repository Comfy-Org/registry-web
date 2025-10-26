'use client'

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { AxiosResponse } from 'axios'
import { getAuth } from 'firebase/auth'
import { ThemeModeScript } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DIE } from 'phpdie'
import { AXIOS_INSTANCE } from '@/src/api/mutator/axios-instance'
import app from '@/src/firebase'
import FlowBiteThemeProvider from '../components/flowbite-theme'
import Layout from '../components/layout'

// Add an interceptor to attach the Firebase JWT token to every request
AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const auth = getAuth(app)
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    sessionStorage.setItem('idToken', token)
    config.headers.Authorization = `Bearer ${token}`
  } else {
    const cachedIdtoken = sessionStorage.getItem('idToken') ?? ''
    if (cachedIdtoken) config.headers.Authorization = `Bearer ${cachedIdtoken}`
  }
  return config
})

const createQueryClient = () =>
  new QueryClient({
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => createQueryClient())

  useEffect(() => {
    // General localStorage cache invalidation for all endpoints
    // this interceptors will user always have latest data after edit.
    const responseInterceptor = AXIOS_INSTANCE.interceptors.response.use(
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

    // Persist query client
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
      buster: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'v1',
    })

    return () => {
      AXIOS_INSTANCE.interceptors.response.eject(responseInterceptor)
      unsubscribe()
    }
  }, [queryClient])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeScript />
      <FlowBiteThemeProvider>
        <Layout>{children}</Layout>
        <ToastContainer />
      </FlowBiteThemeProvider>
    </QueryClientProvider>
  )
}
