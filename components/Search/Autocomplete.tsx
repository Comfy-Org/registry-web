import React, { useMemo } from 'react'
import { createElement, Fragment, useEffect, useRef, useState } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions'
import { useSearchBox } from 'react-instantsearch'
import { autocomplete, AutocompleteOptions } from '@algolia/autocomplete-js'
import { BaseItem } from '@algolia/autocomplete-core'

import '@algolia/autocomplete-theme-classic'
import {
    NODES_QUERY_SUGGESTIONS_INDEX,
    NODES_SEARCH_INDEX,
} from 'src/constants'
import { SearchClient } from 'algoliasearch/lite'

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

    useEffect(() => {
        setQuery(instantSearchUiState.query)
    }, [instantSearchUiState])

    const plugins = useMemo(() => {
        const querySuggestions = createQuerySuggestionsPlugin({
            searchClient,
            indexName: NODES_QUERY_SUGGESTIONS_INDEX,
            getSearchParams() {
                return {
                    hitsPerPage: 6,
                }
            },
            categoryAttribute: [NODES_SEARCH_INDEX, 'facets', 'exact_matches'],
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
                }
            },
        })

        return [querySuggestions]
    }, [searchClient, setInstantSearchUiState])

    useEffect(() => {
        if (!autocompleteContainer.current) {
            return
        }

        const autocompleteInstance = autocomplete({
            ...autocompleteProps,
            container: autocompleteContainer.current,
            initialState: { query },
            plugins,
            onReset() {
                setInstantSearchUiState({ query: '' })
            },
            onSubmit({ state }) {
                setInstantSearchUiState({ query: state.query })
            },
            onStateChange({ prevState, state }) {
                if (prevState.query !== state.query) {
                    setInstantSearchUiState({
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
            navigator: {
                navigate({ itemUrl }) {
                    window.location.assign(itemUrl)
                },
                navigateNewTab({ itemUrl }) {
                    const windowReference = window.open(
                        itemUrl,
                        '_blank',
                        'noopener'
                    )

                    if (windowReference) {
                        windowReference.focus()
                    }
                },
                navigateNewWindow({ itemUrl }) {
                    window.open(itemUrl, '_blank', 'noopener')
                },
            },
        })

        return () => autocompleteInstance.destroy()
    }, [])

    return <div className={className} ref={autocompleteContainer} />
}

export default Autocomplete
