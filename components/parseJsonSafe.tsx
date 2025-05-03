export function parseJsonSafe(json: string | null | undefined) {
    try {
        return { data: JSON.parse(json?.toString() as string), error: null }
    } catch (e) {
        return { error: e, data: null }
    }
}
