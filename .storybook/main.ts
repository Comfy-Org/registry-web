import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path, { relative, resolve } from 'node:path'
import fastGlob from 'fast-glob'
import { time, timeEnd, timeLog } from 'node:console'
const config: StorybookConfig = {
  stories: [
    '../app/**/*.mdx',
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    'msw-storybook-addon',
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@storybook/addon-actions',
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public', '../src/assets'],
  viteFinal: async (c) => {
    const PATH = (p: string) => path.resolve(process.cwd(), p)
    
    return mergeConfig(c, {
      server: { allowedHosts: true },
      plugins: [
        {
          name: 'mock-resolver',
          enforce: 'pre',
          resolveId(id, importer) {
            const pathname = relative(
              process.cwd(),
              resolve(path.dirname(importer), id)
            )
            if (id.replace(/^(\.\.\/)+/, '') === 'src/hooks/useFirebaseUser') {
              const resolved = PATH('./src/hooks/useFirebaseUser.mock.ts')
              return resolved
            }
          },
        },
        ...(c.plugins || []),
      ],
      resolve: {
        alias: {
          '@': path.resolve(process.cwd()),
        },
      },
    })
  },
}
export default config
