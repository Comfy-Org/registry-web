import type { Preview } from '@storybook/react'
import '../styles/globals.css' // Import the global CSS file

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        nextRouter: {
            Provider: () => ({
                push: () => {},
                replace: () => {},
                pathname: '/',
                query: {},
                asPath: '/',
                route: '/',
                back: () => {},
                forward: () => {},
                reload: () => {},
                events: {
                    on: () => {},
                    off: () => {},
                    emit: () => {},
                },
                prefetch: () => Promise.resolve(),
                beforePopState: () => {},
                isFallback: false,
                isLocaleDomain: false,
                isReady: true,
                isPreview: false,
                basePath: '',
                locale: 'en',
                locales: ['en'],
                defaultLocale: 'en',
            }),
        },
    },
}

export default preview
