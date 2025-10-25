import path from 'node:path'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import { mergeConfig } from 'vite'

// Dynamic import to avoid build-time issues
let createMockResolverPlugin: any

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
    staticDirs: ['../src/assets'],
    // Inject base tag for manager (navigation/toolbar) when deploying to /_storybook/
    managerHead:
        process.env.CHROMATIC !== 'true'
            ? (head) => `
        ${head}
        <base href="/_storybook/" />
      `
            : undefined,
    // Inject base tag for preview (iframe where components render) when deploying to /_storybook/
    previewHead:
        process.env.CHROMATIC !== 'true'
            ? (head) => `
        ${head}
        <base href="/_storybook/" />
      `
            : undefined,
    viteFinal: async (c, { configType }) => {
        // Dynamically import the plugin to avoid build issues
        if (!createMockResolverPlugin) {
            const mockPlugin = await import('./mockResolverPlugin.js')
            createMockResolverPlugin = mockPlugin.createMockResolverPlugin
        }

        return mergeConfig(c, {
            // Only set custom base path for production builds (not for Chromatic)
            base:
                configType === 'PRODUCTION' && process.env.CHROMATIC !== 'true'
                    ? '/_storybook/'
                    : c.base,
            server: {
                allowedHosts: true,
                hmr: { clientPort: 443 },
            },
            plugins: [await createMockResolverPlugin()],
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
