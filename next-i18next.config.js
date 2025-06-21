import {resolve}   from 'path';
/**
 * @type {import('next-i18next').UserConfig}
 */
const config = {
    i18n: {
        defaultLocale: 'en',
        locales: ['en', 'ja', 'zh'],
    },
    defaultNS: 'common',
    localePath:
        typeof window === 'undefined'
            ? resolve('./public/locales')
            : '/locales',
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}
export default config
