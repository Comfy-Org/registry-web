import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path, { relative } from 'node:path'
import fastGlob from 'fast-glob'
const config: StorybookConfig = {
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
    // const mocks = await fastGlob('./src/**/*.mock.ts')
    // console.log('Found mocks:', mocks)
    const PATH = (p: string) => path.resolve(process.cwd(), p)

    return mergeConfig(c, {
      server: { allowedHosts: true },
    //   plugins: [
    //     ...(c.plugins || []),
    //     // {
    //     //   name: 'mock-resolver',
    //     //   resolveId(id, importer) {
    //     //     const pathname = relative(process.cwd(), id)
    //     //     console.log('Resolving ID:', pathname, 'from:', importer)
    //     //     if (pathname === '@/src/hooks/useFirebaseUser') {
    //     //       const resolved = PATH('./src/hooks/useFirebaseUser.mock.ts')
    //     //       console.log('!!!! Redirecting to mock:', resolved)
    //     //       return resolved
    //     //     }
    //     //     return null
    //     //   },
    //     // },
    //   ],
      resolve: {
        alias: {
            '@/': PATH('./'),
        },
      },
    })
  },
}
export default config
