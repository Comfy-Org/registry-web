import type { Preview } from "@storybook/nextjs-vite";
import "../styles/globals.css"; // Import the global CSS file
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/firebase"; // Initialize Firebase for Storybook
import { mockFirebaseUser, useFirebaseUser } from "@/src/hooks/useFirebaseUser";

const _mswApp = initialize({
  onUnhandledRequest: "bypass",
});

const languageName = (lang: string) => new Intl.DisplayNames(lang, { type: "language" }).of(lang);

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
    a11y: {
      // Run axe-core checks as test assertions — violations will fail the Vitest Storybook tests
      test: "error",
    },
  },
  beforeEach: async () => {
    useFirebaseUser.mockReturnValue([mockFirebaseUser, false, undefined]);
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
      });
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      description: "Theme for the components",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "dark", right: "🌙", title: "Dark" }, // default
          { value: "light", right: "☀️", title: "Light" },
          { value: "system", right: "🖥️", title: "System" },
        ],
      },
    },
    locale: {
      description: "Internationalization locale",
      toolbar: {
        icon: "globe",
        items: [
          { value: "en", right: "🇺🇸", title: languageName("en") },
          { value: "es", right: "🇪🇸", title: languageName("es") },
          { value: "fr", right: "🇫🇷", title: languageName("fr") },
          { value: "ja", right: "🇯🇵", title: languageName("ja") },
          { value: "kr", right: "🇰🇷", title: languageName("kr") },
          { value: "zh", right: "🇨🇳", title: languageName("zh") },
        ],
      },
    },
  },
  initialGlobals: {
    locale: "en",
  },
  tags: ["autodocs"],
};

export default preview;
