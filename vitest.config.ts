import path from 'node:path'
import type {} from '@vitest/browser/providers/playwright'
import { fileURLToPath } from 'node:url'
import storybookTest from '@storybook/addon-vitest/vitest-plugin'
import { defineConfig } from 'vitest/config'

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname // run by nodejs, vitest
    : path.dirname(fileURLToPath(import.meta.url)) // bun

// Vitest assigns names to browser instances, so projects need separate objects.
const browser = () => ({
  enabled: true,
  headless: true,
  provider: 'playwright' as const,
  instances: [
    {
      browser: 'chromium' as const,
      launch: {
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      },
    },
  ],
})

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineConfig({
  // Exercise the integrated feedback pages even when the production flag is off.
  define: {
    'process.env.NEXT_PUBLIC_PRIVATE_VERSION_FEEDBACK_ENABLED': '"true"',
  },
  test: {
    workspace: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
          // @ts-expect-error: The storybookTest plugin has incomplete type definitions, but it works as expected.
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: browser(),
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'auth-hydration',
          // Keep the actual hook outside Storybook's module-mocking plugin.
          include: ['tests/browser/firebase-hydration.tsx'],
          browser: browser(),
        },
      },
    ],
  },
})
