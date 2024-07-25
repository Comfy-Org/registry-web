import React, { useMemo } from 'react'
import { createElement, Fragment, useEffect, useRef, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'

import type { BaseItem } from '@algolia/autocomplete-core'
import type { AutocompleteOptions } from '@algolia/autocomplete-js'
import {
    useSearchBox,
} from 'react-instantsearch'
import { autocomplete } from '@algolia/autocomplete-js'
import { createLocalStorageRecentSearchesPlugin } from '@algolia/autocomplete-plugin-recent-searches'

import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { debounce } from '@algolia/autocomplete-shared'
import type { SearchClient } from 'algoliasearch/lite'

import '@algolia/autocomplete-theme-classic'
import {
    NODES_QUERY_SUGGESTIONS_INDEX,
    NODES_SEARCH_INDEX,
} from 'src/constants'

type AutocompleteProps = Partial<AutocompleteOptions<BaseItem>> & {
    className?: string
    searchClient: SearchClient
}

type SetInstantSearchUiStateOptions = {
    query: string
}

export function Autocomplete({
    className,
    searchClient,
    ...autocompleteProps
}: AutocompleteProps) {
    const autocompleteContainer = useRef<HTMLDivElement>(null)
    const panelRootRef = useRef<Root | null>(null)
    const rootRef = useRef<HTMLElement | null>(null)

    const { query, refine: setQuery } = useSearchBox()

    const [instantSearchUiState, setInstantSearchUiState] =
        useState<SetInstantSearchUiStateOptions>({ query })
    const debouncedSetInstantSearchUiState = debounce(
        setInstantSearchUiState,
        500
    )

    useEffect(() => {
        setQuery(instantSearchUiState.query)
    }, [instantSearchUiState])

    const plugins = useMemo(() => {
        const recentSearches = createLocalStorageRecentSearchesPlugin({
            key: 'instantsearch',
            limit: 3,
            transformSource({ source }) {
                return {
                    ...source,
                    onSelect({ item }) {
                        setInstantSearchUiState({
                            query: item.label,
                        })
                    },
                }
            },
        })

        const querySuggestions = createQuerySuggestionsPlugin({
            searchClient,
            indexName: NODES_QUERY_SUGGESTIONS_INDEX,
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
                setInstantSearchUiState({ query: '' })
            },
            onSubmit({ state }) {
                setInstantSearchUiState({ query: state.query })
            },
            onStateChange({ prevState, state }) {
                if (prevState.query !== state.query) {
                    debouncedSetInstantSearchUiState({
                        query: state.query,
                    })
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

export default Autocomplete
