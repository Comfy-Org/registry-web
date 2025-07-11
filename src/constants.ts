export const INSTANT_SEARCH_INDEX_NAME = 'nodes_index'
export const INSTANT_SEARCH_QUERY_SUGGESTIONS = 'nodes_index_query_suggestions'
export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
    'hierarchicalCategories.lvl0',
    'hierarchicalCategories.lvl1',
]

export const UNCLAIMED_ADMIN_PUBLISHER_ID =
    'admin-11338bd3-f081-43cf-b3f9-295c829826f7' // copy from https://github.com/Comfy-Org/comfy-api/blob/main/db/publisher.go#L13

// Storage key for language preference
export const LANGUAGE_STORAGE_KEY =
    'comfy-registry-language-preference' as const

// Language configuration
export const SUPPORTED_LANGUAGES = [
    'en',
    'zh',
    'ja',
    'fr',
    'es',
    'ko',
    'ru',
] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE = 'en'
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    en: 'English',
    zh: '中文',
    ja: '日本語',
    fr: 'Français',
    es: 'Español',
    ko: '한국어',
    ru: 'Русский',
}

// HTTP Cache Control Headers
export const NO_CACHE_HEADERS = {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
} as const

// Type for request options with no-cache headers
export const REQUEST_OPTIONS_NO_CACHE = {
    headers: NO_CACHE_HEADERS,
} as const
