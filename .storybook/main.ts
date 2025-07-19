import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'node:path'
import fastGlob from 'fast-glob'
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
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  staticDirs: ['../public', '../src/assets'],
  viteFinal: async (c) => {
    const mocks = await fastGlob('./src/**/*.mock.ts')
    console.log(mocks)
    const PATH = (p: string) => path.resolve(process.cwd(), p)
    return mergeConfig(c, {
      server: { allowedHosts: true },
      resolve: {
        alias: {
          //   '@/': PATH('/'),
          // '@/src/hooks/useFirebaseUser': PATH(
          //     '/src/hooks/useFirebaseUser.mock.ts'
          // ),
        },
      },
    })
  },
}
export default config
