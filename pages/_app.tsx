import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/layout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import FlowBiteThemeProvider from '../components/flowbite-theme'
interface CustomAppProps extends AppProps {
    session: any
}

export default function App({ Component, session, pageProps }: CustomAppProps) {
    const queryClient = new QueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            <FlowBiteThemeProvider>
                <SessionProvider session={session}>
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </SessionProvider>
            </FlowBiteThemeProvider>
        </QueryClientProvider>
    )
}
