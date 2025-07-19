import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/nextjs-vite'
import path from 'node:path'

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
        '@chromatic-com/storybook',
        '@storybook/addon-vitest',
        '@storybook/addon-docs',
    ],
    framework: {
        name: '@storybook/nextjs-vite',
        options: {},
    },
    staticDirs: ['../public', '../src/assets'],
    viteFinal: (c) =>
        mergeConfig(c, {
            server: { allowedHosts: true },
            resolve: {
                alias: {
                    '@': path.resolve(process.cwd()),
                },
            },
        }),
}
export default config
