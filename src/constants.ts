export const INSTANT_SEARCH_INDEX_NAME = 'nodes_index'
export const INSTANT_SEARCH_QUERY_SUGGESTIONS = 'nodes_index_query_suggestions'
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
    'hierarchicalCategories.lvl0',
    'hierarchicalCategories.lvl1',
]

export const UNCLAIMED_ADMIN_PUBLISHER_ID =
    'admin-11338bd3-f081-43cf-b3f9-295c829826f7' // copy from https://github.com/Comfy-Org/comfy-api/blob/main/db/publisher.go#L13
// Storage key for language preference

export const LANGUAGE_STORAGE_KEY = 'comfy-registry-language-preference' as const
