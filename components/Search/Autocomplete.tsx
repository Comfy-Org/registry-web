import type { BaseItem } from '@algolia/autocomplete-core'
import type { AutocompleteOptions } from '@algolia/autocomplete-js'
import type { SearchClient } from 'algoliasearch/lite'

import {
    createElement,
    Fragment,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { createRoot, Root } from 'react-dom/client'

import { autocomplete } from '@algolia/autocomplete-js'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches'
import { usePagination, useSearchBox } from 'react-instantsearch'
// @ts-ignore
import { debounce } from '@algolia/autocomplete-shared'

import { INSTANT_SEARCH_QUERY_SUGGESTIONS } from 'src/constants'

import '@algolia/autocomplete-theme-classic'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
    searchClient: SearchClient
    className?: string
}

type SetInstantSearchUiStateOptions = {
    query: string
}

export default function Autocomplete({
    searchClient,
    className,
    ...autocompleteProps
}: AutocompleteProps) {
    const autocompleteContainer = useRef<HTMLDivElement>(null)
    const panelRootRef = useRef<Root | null>(null)
    const rootRef = useRef<HTMLElement | null>(null)

    const { query, refine: setQuery } = useSearchBox()

    const { refine: setPage } = usePagination()

    const [instantSearchUiState, setInstantSearchUiState] =
        useState<SetInstantSearchUiStateOptions>({ query })
    const debouncedSetInstantSearchUiState = debounce(
        setInstantSearchUiState,
        500
    )

    useEffect(() => {
        setQuery(instantSearchUiState.query)
        setPage(0)
    }, [instantSearchUiState, setQuery])

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
                        setInstantSearchUiState({
                            query: item.query,
                        })
                    },
                    getItems(params) {
                        if (!params.state.query) {
                            return []
                        }

                        return source.getItems(params)
                    },
                    templates: {
                        ...source.templates,
                        header({ items }) {
                            if (items.length === 0) {
                                return <Fragment />
                            }

                            return (
                                <Fragment>
                                    <span className="aa-SourceHeaderTitle">
                                        In other categories
                                    </span>
                                    <span className="aa-SourceHeaderLine" />
                                </Fragment>
                            )
                        },
                    },
                }
            },
        })

        return [recentSearches, querySuggestions]
    }, [])

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
            onReset() {
                setInstantSearchUiState({
                    query: '',
                })
            },
            onSubmit({ state }) {
                setInstantSearchUiState({ query: state.query })
            },
            onStateChange({ prevState, state }) {
                if (prevState.query !== state.query) {
                    debouncedSetInstantSearchUiState({ query: state.query })
                }
            },
            renderer: { createElement, Fragment, render: () => {} },
            render({ children }, root) {
                if (!panelRootRef.current || rootRef.current !== root) {
                    rootRef.current = root
                    panelRootRef.current?.unmount()
                    panelRootRef.current = createRoot(root)
                }

                panelRootRef.current.render(children)
            },
        })

        return () => autocompleteInstance.destroy()
    }, [plugins])

    return <div className={className} ref={autocompleteContainer} />
}
