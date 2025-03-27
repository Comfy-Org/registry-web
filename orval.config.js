// orval.config.js
module.exports = {
    dripApi: {
        input: {
            target: 'https://api.comfy.org/openapi',
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
