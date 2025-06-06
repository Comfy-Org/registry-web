// load backend url from .env, not necessary if you use bun
if (!globalThis.Bun) require('dotenv/config')

/**
 * @type {import('orval').ConfigExternal}
 */
export default {
    dripApi: {
        input: {
            target: `${process.env.NEXT_PUBLIC_BACKEND_URL}/openapi`,
        },
        output: {
            target: './src/api/generated.ts',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/mutator/axios-instance.ts',
                    name: 'customInstance',
                },
            },
        },
    },
}
