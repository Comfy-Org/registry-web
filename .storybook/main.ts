import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path, { relative, resolve } from 'node:path'
import fastGlob from 'fast-glob'
import { time, timeEnd, timeLog } from 'node:console'
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

    const cfg = {
      ...c,
      resolve: {
        ...c.resolve,
        alias: {
          ...c.resolve?.alias,
          '@': PATH('./'),
        },
      },
      server: {
        ...c.server,
        allowedHosts: true,
      },
      plugins: [
        {
          name: 'mock-resolver',

          enforce: 'pre',
          resolveId(id, importer) {
            const pathname = relative(process.cwd(), id)
            console.log('Resolving ID:', pathname, 'from:', importer)
            if (pathname === '@/src/hooks/useFirebaseUser') {
              const resolved = PATH('./src/hooks/useFirebaseUser.mock.ts')
              console.log('!!!! Redirecting to mock:', resolved)
              return resolved
            }
            return null
          },
        },
        ...(c.plugins || []),
      ],
    }
    const cfg2 = mergeConfig(c, {
      server: { allowedHosts: true },
      plugins: [
        {
          name: 'mock-resolver',
          enforce: 'pre',
          // This plugin resolves the useFirebaseUser hook to its mock version
          resolveId(id, importer) {
            if (!importer) return null
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
      ],
      resolve: {
        alias: {},
      },
    })

    console.dir(cfg)
    console.dir(cfg2)
    return cfg2
  },
}
export default config
