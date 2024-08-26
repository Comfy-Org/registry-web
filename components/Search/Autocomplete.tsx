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
} from 'src/constants' // Only import necessary constants

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
    // Refs for DOM elements and the root for rendering the panel
    const autocompleteContainer = useRef<HTMLDivElement>(null)
    const panelRootRef = useRef<Root | null>(null)
    const rootRef = useRef<HTMLElement | null>(null)

    // Hooks for managing state from Algolia's useSearchBox and usePagination
    const { query, refine: setQuery } = useSearchBox()

    // Local state to manage instant search UI state with debounced updates
    const [instantSearchUiState, setInstantSearchUiState] =
        useState<SetInstantSearchUiStateOptions>({ query })
    const debouncedSetInstantSearchUiState = debounce(
        setInstantSearchUiState,
        500
    )

    // Update the query in Algolia's useSearchBox when the instant search UI state changes
    useEffect(() => {
        setQuery(instantSearchUiState.query)
    }, [instantSearchUiState, setQuery])

    // Memoize the creation of plugins for recent searches and query suggestions
    const plugins = useMemo(() => {
        const recentSearches = createLocalStorageRecentSearchesPlugin({
            key: 'instantsearch',
            limit: 3,
            transformSource({ source }) {
                return {
                    ...source,
                    onSelect({ item }) {
                        setInstantSearchUiState({ query: item.label })
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
                        // Update the instant search state with the selected suggestion
                        setInstantSearchUiState({ query: item.name })

                        // Update the input field with the selected suggestion
                        const inputElement = document.querySelector('.aa-Input')
                        if (inputElement) {
                            inputElement.value = item.name
                        }

                        // Perform a search on the main index and add the query to recent searches
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

    // Initialize the autocomplete instance with the specified plugins and options
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
                // Perform a search on form submission
                setInstantSearchUiState({ query: state.query })

                searchClient
                    .search([
                        {
                            indexName: INSTANT_SEARCH_INDEX_NAME,
                            query: state.query,
                            params: { hitsPerPage: 10 },
                        },
                    ])
                    .catch((err) => {
                        console.error('Search failed:', err)
                    })
            },
            onStateChange({ prevState, state }) {
                // Update the instant search UI state on query change
                if (prevState.query !== state.query) {
                    debouncedSetInstantSearchUiState({ query: state.query })
                }
            },
            renderer: {
                createElement,
                Fragment,
                render: () => {},
            },
            render({ children }, root) {
                // Ensure the root is mounted correctly for rendering
                if (!panelRootRef.current || rootRef.current !== root) {
                    rootRef.current = root
                    panelRootRef.current?.unmount()
                    panelRootRef.current = createRoot(root)
                }

                panelRootRef.current.render(children)
            },
        })

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
