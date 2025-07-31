import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'node:path'
import { watch } from '@snomiao/glob-watch'

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
          '@': PATH('./'),
        },
      },
    })
  },
})

function defineConfig<T extends StorybookConfig>(v: T): T {
  return v
}

/**
 * Creates a Vite plugin that automatically redirects imports from original files to their mock versions
 * Scans for all .mock.ts files and creates redirect rules
 */
export async function createMockResolverPlugin() {
  // Scan for all .mock.ts files
  const mockMap = new Map<string, string>()
  const glob = '**/*.mock.{ts,tsx}'
  const _destroy = await watch(
    glob,
    ({ added, deleted }) => {
      const id = (path: string) => path.replace(/\.mock(\.tsx?)$/, '')
      added.forEach(({ path }) => {
        mockMap.set(id(path), path)
        console.log(`+ Mock ${path}`)
      })
      deleted.forEach(({ path }) => {
        mockMap.delete(id(path))
        console.log(`- Mock ${path}`)
      })
    },
    {
      cwd: process.cwd(),
      ignore: ['node_modules/**'],
      mode: 'fast-glob',
    }
  )

  return {
    name: 'mock-resolver',
    enforce: 'pre' as const,
    resolveId(id: string, importer?: string) {
      // Normalize the import ID by removing relative path prefixes
      const normalizedId = id.replace(/^(?:\.\.\/)+/, '')
      if (mockMap.has(normalizedId)) {
        const mockPath = mockMap.get(normalizedId)!
        const resolvedPath = path.resolve(process.cwd(), mockPath)
        console.log(`⚒️  Mocking ${mockPath} in ${importer || 'unknown'}`)
        return resolvedPath
      }
    },
  }
}
