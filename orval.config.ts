import dotenv from 'dotenv'
import { existsSync } from 'fs'

// load backend url from .env.local and .env, not necessary if you use bun
if (!globalThis.Bun) {
    dotenv.config({ path: ['.env.local', '.env'] })
}

/**
 * @type {import('orval').ConfigExternal}
 */
export default {
    dripApi: {
        input: {
            target: existsSync('./openapi.yaml')
                ? './openapi.yaml'
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/openapi`,
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
