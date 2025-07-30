import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path, { relative, resolve } from 'node:path'
import fastGlob from 'fast-glob'
import { time, timeEnd, timeLog } from 'node:console'

/**
 * Creates a Vite plugin that automatically redirects imports from original files to their mock versions
 * Scans for all .mock.ts files and creates redirect rules
 */
function createMockResolverPlugin() {
  // Scan for all .mock.ts files
  const mockFiles = fastGlob.sync('**/*.mock.ts', {
    cwd: process.cwd(),
    ignore: ['node_modules/**'],
  })

  // Create a map of original paths to mock paths
  const mockMap = new Map<string, string>()

  mockFiles.forEach((mockFile) => {
    // Remove .mock.ts and add .ts to get original file path
    const originalFile = mockFile.replace(/\.mock\.ts$/, '.ts')
    // Convert to relative import path format
    const originalImport = originalFile.replace(/^src\//, 'src/')
    mockMap.set(originalImport, mockFile)
  })

  console.log(
    '🔧 Mock resolver plugin initialized with redirects:',
    Object.fromEntries(mockMap)
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
        console.log(`⚒️  Redirecting ${normalizedId} to mock: ${mockPath}`)
        return resolvedPath
      }
    },
  }
}
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
    return mergeConfig(c, {
      server: { allowedHosts: true },
      plugins: [createMockResolverPlugin()],
      resolve: {
        alias: {
          '@': PATH('./'),
        },
      },
    })
  },
}
export default config
