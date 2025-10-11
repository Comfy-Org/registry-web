export const CAPI = (path: `/${string}`) => {
    // api.comfy.org
    return new URL(path, process.env.NEXT_PUBLIC_BACKEND_URL!).toString()
}

// TODO: add algolia search handler...
export const ALGO = (_path: `/${string}`) => {
    // algolia
    throw 'WIP'
}
