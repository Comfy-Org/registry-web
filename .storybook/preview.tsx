import type { Preview } from '@storybook/nextjs-vite'
import '../styles/globals.css' // Import the global CSS file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initialize, mswLoader } from 'msw-storybook-addon'

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
  globalTypes: {
    locale: {
      description: 'Internationalization locale',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'es', right: '🇪🇸', title: 'Español' },
          { value: 'fr', right: '🇫🇷', title: 'Français' },
          { value: 'ja', right: '🇯🇵', title: '日本語' },
          { value: 'kr', right: '🇰🇷', title: '한국어' },
          { value: 'zh', right: '🇨🇳', title: '中文' },
        ],
      },
    },
  },
  initialGlobals: {
    locale: 'en',
  },
}

export default preview
