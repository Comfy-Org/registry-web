require('dotenv/config') // load backend url from .env

// orval.config.js
module.exports = {
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
