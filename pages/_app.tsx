import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import FlowBiteThemeProvider from '../components/flowbite-theme'

export default function App({ Component, pageProps }: AppProps) {
    const queryClient = new QueryClient()

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
