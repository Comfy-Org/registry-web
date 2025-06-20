import mdx from '@next/mdx'
import { NextConfig } from 'next'

const withMDX = mdx({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: [],
        // If you use `MDXProvider`, uncomment the following line.
        providerImportSource: '@mdx-js/react',
    },
})

const conf: NextConfig = {
    reactStrictMode: true,
    // i18n: i18nConfig.i18n,
    i18n: {
        locales: ['en', 'zh', 'ja'],
        defaultLocale: 'en',
    },

    // Append the default value with md extensions
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    images: {
        unoptimized: true,
        domains: [
            // user avatar
            'avatars.githubusercontent.com',
            // image
            'firebasestorage.googleapis.com',
            'storage.googleapis.com',
            'via.placeholder.com',
        ],
    },
    webpack: (config) => {
        config.experiments.topLevelAwait = true
        return config
    },
    transpilePackages: ['@algolia/autocomplete-shared'],

    async redirects() {
        return [
            {
                source: '/discord',
                destination: 'https://discord.gg/comfyorg',
                permanent: false,
            },
        ]
    },
}
export default withMDX(conf)
