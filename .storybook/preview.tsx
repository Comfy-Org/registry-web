import type { Preview } from '@storybook/nextjs-vite'
import '../styles/globals.css' // Import the global CSS file
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initialize, mswLoader } from 'msw-storybook-addon'
import '../src/firebase' // Initialize Firebase for Storybook
import {
  mockFirebaseUser,
  useFirebaseUser,
} from '@/src/hooks/useFirebaseUser.mock'

const _mswApp = initialize({
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
    docs: {
      toc: true,
    },
  },
  beforeEach: async () => {
    useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined])
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
    darkMode: {
      description: 'Toggle dark mode',
      defaultValue: 'dark',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', right: '☀️', title: 'Light Mode' },
          { value: 'dark', right: '🌙', title: 'Dark Mode' },
        ],
      },
    },
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
  tags: ['autodocs'],
}

export default preview
