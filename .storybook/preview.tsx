import type { Preview } from '@storybook/react'
import '../styles/globals.css' // Import the global CSS file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Initialize MSW for Storybook
import { initialize, mswLoader } from 'msw-storybook-addon'

initialize({
    onUnhandledRequest: ({ url, method }) => {
        const pathname = new URL(url).pathname
        console.error(`Unhandled ${method} request to ${url}.

    This exception has been only logged in the console, however, it's strongly recommended to resolve this error as you don't want unmocked data in Storybook stories.

    If you wish to mock an error response, please refer to this guide: https://mswjs.io/docs/recipes/mocking-error-responses
  `)
    },
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
