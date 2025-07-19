import type { Preview } from '@storybook/react'
import '../styles/globals.css' // Import the global CSS file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Initialize MSW for Storybook
import { initialize, mswLoader } from 'msw-storybook-addon'
import { CAPI } from '../src/mocks/handlers'

initialize({
    onUnhandledRequest: 'bypass',
})

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        msw: {
            handlers: [],
        },
    },
    loaders: [mswLoader],
    decorators: [
        (Story) => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: false,
                        staleTime: 0,
                    },
                },
            })
            return (
                <QueryClientProvider client={queryClient}>
                    <Story />
                </QueryClientProvider>
            )
        },
    ],
}

export default preview
