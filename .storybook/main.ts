import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'node:path'
// @ts-ignore - JS module to avoid TypeScript compilation issues
import { createMockResolverPlugin } from './mockResolverPlugin.js'

export default defineConfig({
  stories: [
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/stories/**/*.mdx',
  ],
  addons: [
    'msw-storybook-addon',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public', '../src/assets'],
  viteFinal: async (c) => {
    return mergeConfig(c, {
      server: {
        allowedHosts: true,
        hmr: { clientPort: 443 },
      },
      plugins: [createMockResolverPlugin()],
      resolve: {
        alias: {
          '@/src/hooks/useFirebaseUser': path.resolve(
            __dirname,
            '../src/hooks/useFirebaseUser.mock.ts'
          ),
        },
      },
    })
  },
})

function defineConfig<T extends StorybookConfig>(v: T): T {
  return v
}
