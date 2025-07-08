import { mergeConfig } from 'vite'
import type { StorybookConfig } from '@storybook/experimental-nextjs-vite'
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
        '@storybook/addon-essentials',
        '@storybook/addon-onboarding',
        '@chromatic-com/storybook',
        '@storybook/experimental-addon-test',
    ],
    framework: {
        name: '@storybook/experimental-nextjs-vite',
        options: {},
    },
    staticDirs: ['../public'],
    viteFinal: (c) => mergeConfig(c, {
        server: { allowedHosts: true },
        resolve: {
            alias: {
                '@': path.resolve(process.cwd()),
            },
        },
    }),
}
export default config
