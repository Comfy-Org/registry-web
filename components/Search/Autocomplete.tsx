import '@algolia/autocomplete-theme-classic'
import type { SearchClient } from 'algoliasearch/lite'
import type { BaseItem } from '@algolia/autocomplete-core'
import type { AutocompleteOptions } from '@algolia/autocomplete-js'

import {
    createElement,
    Fragment,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { createRoot, Root } from 'react-dom/client'

import { useSearchBox } from 'react-instantsearch'
import { autocomplete } from '@algolia/autocomplete-js'
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { debounce } from '@algolia/autocomplete-shared'

import {
    INSTANT_SEARCH_INDEX_NAME,
    INSTANT_SEARCH_QUERY_SUGGESTIONS,
} from 'src/constants'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
    searchClient: SearchClient
    className?: string
}

type SetInstantSearchUiStateOptions = {
    query: string
}

export function Autocomplete({
    searchClient,
    className,
    ...autocompleteProps
}: AutocompleteProps) {
    const autocompleteContainer = useRef<HTMLDivElement>(null)
    const panelRootRef = useRef<Root | null>(null)
    const rootRef = useRef<HTMLElement | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const { query, refine: setQuery } = useSearchBox()

    const [instantSearchUiState, setInstantSearchUiState] =
        useState<SetInstantSearchUiStateOptions>({ query })
    const debouncedSetInstantSearchUiState = debounce(
        setInstantSearchUiState,
        500
    )

    useEffect(() => {
        setQuery(instantSearchUiState.query)
    }, [instantSearchUiState, setQuery])

    const focusInput = () => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const plugins = useMemo(() => {
        const recentSearches = createLocalStorageRecentSearchesPlugin({
            key: 'instantsearch',
            limit: 3,
            transformSource({ source }) {
                return {
                    ...source,
                    onSelect({ item }) {
                        setInstantSearchUiState({ query: item.label })
                        focusInput()
                    },
                }
            },
        })

        const querySuggestions = createQuerySuggestionsPlugin({
            searchClient,
            indexName: INSTANT_SEARCH_QUERY_SUGGESTIONS,
            getSearchParams() {
                return recentSearches.data!.getAlgoliaSearchParams({
                    hitsPerPage: 6,
                })
            },
            transformSource({ source }) {
                return {
                    ...source,
                    sourceId: 'querySuggestionsPlugin',
                    onSelect({ item }) {
                        setInstantSearchUiState({ query: item.name })

                        if (inputRef.current) {
                            inputRef.current.value = item.name
                        }

                        searchClient
                            .search([
                                {
                                    indexName: INSTANT_SEARCH_INDEX_NAME,
                                    query: item.name,
                                    params: { hitsPerPage: 10 },
                                },
                            ])
                            .then(() => {
                                recentSearches.data!.addItem({
                                    id: item.name,
                                    label: item.name,
                                })
                                focusInput()
                            })
                            .catch((err) => {
                                console.error('Search failed:', err)
                            })

                        debouncedSetInstantSearchUiState({ query: item.name })
                    },
                    templates: {
                        item({ item }) {
                            return (
                                <div className="aa-ItemWrapper">
                                    <div className="aa-ItemContent">
                                        <div className="aa-ItemTitle">
                                            {item.name}
                                        </div>
                                    </div>
                                </div>
                            )
                        },
                    },
                }
            },
        })

        return [recentSearches, querySuggestions]
    }, [searchClient, debouncedSetInstantSearchUiState])

    useEffect(() => {
        if (!autocompleteContainer.current) {
            return
        }
        const autocompleteInstance = autocomplete({
            ...autocompleteProps,
            container: autocompleteContainer.current,
            initialState: { query },
            insights: true,
            plugins,
            onSubmit({ state }) {
                setInstantSearchUiState({ query: state.query })
                console.log('On Submit')
                searchClient
                    .search([
                        {
                            indexName: INSTANT_SEARCH_INDEX_NAME,
                            query: state.query,
                            params: { hitsPerPage: 10 },
                        },
                    ])
                    .then(() => {
                        focusInput()
                    })
                    .catch((err) => {
                        console.error('Search failed:', err)
                    })
            },
            onStateChange({ prevState, state }) {
                if (prevState.query !== state.query) {
                    console.log('State changed')
                    debouncedSetInstantSearchUiState({ query: state.query })
                }
            },
            renderer: {
                createElement,
                Fragment,
                render: () => {},
            },
            render({ children }, root) {
                if (!panelRootRef.current || rootRef.current !== root) {
                    rootRef.current = root
                    panelRootRef.current?.unmount()
                    panelRootRef.current = createRoot(root)
                }

                panelRootRef.current.render(children)
            },
        })

        // Store a reference to the input element
        inputRef.current =
            autocompleteContainer.current.querySelector('.aa-Input')

        return () => autocompleteInstance.destroy()
    }, [
        plugins,
        searchClient,
        autocompleteProps,
        query,
        debouncedSetInstantSearchUiState,
    ])

    return (
        <div className={className}>
            <div ref={autocompleteContainer} />
        </div>
    )
}

export default Autocomplete
