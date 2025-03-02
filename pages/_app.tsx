import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FlowBiteThemeProvider from '../components/flowbite-theme'

export default function App({ Component, pageProps }: AppProps) {
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
