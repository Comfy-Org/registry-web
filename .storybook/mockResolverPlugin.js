import path from 'node:path'
import { watch } from '@snomiao/glob-watch'

/**
 * Creates a Vite plugin that automatically redirects imports from original files to their mock versions
 * Scans for all .mock.ts files and creates redirect rules
 */
export async function createMockResolverPlugin() {
    // Scan for all .mock.ts files
    const mockMap = new Map()
    const glob = '**/*.mock.{ts,tsx}'
    const id = (path) => path.replace(/\.mock(\.tsx?)$/, '')

    const _destroy = await watch(
        glob,
        ({ added, deleted }) => {
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
        enforce: 'pre',
        resolveId(id, importer) {
            // Normalize the import ID by removing relative path prefixes
            const normalizedId = id.replace(/^(?:\.\.\/)+/, '')
            if (mockMap.has(normalizedId)) {
                const mockPath = mockMap.get(normalizedId)
                const resolvedPath = path.resolve(process.cwd(), mockPath)
                console.log(
                    `⚒️  Mocking ${mockPath} in ${importer || 'unknown'}`
                )
                return resolvedPath
            }
        },
    }
}
