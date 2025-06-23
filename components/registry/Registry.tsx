import Autocomplete from '@/components/Search/Autocomplete'
import { useNextTranslation } from '@/src/hooks/i18n'
import algoliasearch from 'algoliasearch/lite'
import singletonRouter from 'next/router'
import React from 'react'
import { Configure, Hits, InstantSearch } from 'react-instantsearch'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'
import CustomSearchPagination from '../common/CustomSearchPagination'
import GenericHeader from '../common/GenericHeader'
import Hit from '../Search/SearchHit'

import { INSTANT_SEARCH_INDEX_NAME } from 'src/constants'

// Initialize Algolia search client
const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY as string
)

type RegistryProps = {}

const Registry: React.FC<RegistryProps> = ({}) => {
    const { t } = useNextTranslation()
    return (
        <div className="relative mt-8 bg-gray-900 lg:mt-20 mb-8">
            <GenericHeader
                title={t('Welcome to the Registry')}
                subTitle={t(
                    'View nodes or sign in to create and publish your own'
                )}
                buttonText={t('Get Started')}
                buttonLink="/nodes"
            />

            <div className="md:w-full w-full mt-5">
                <InstantSearch
                    searchClient={searchClient}
                    indexName={INSTANT_SEARCH_INDEX_NAME}
                    routing={{
                        router: Object.assign(
                            createInstantSearchRouterNext({
                                singletonRouter,
                            }),
                            { cleanUrlOnDispose: false }
                        ),
                    }}
                    future={{
                        preserveSharedStateOnUnmount: true,
                    }}
                >
                    <header className="header">
                        <div className="header-wrapper wrapper">
                            <Autocomplete
                                searchClient={searchClient}
                                placeholder={t('Search Nodes')}
                                detachedMediaQuery="none"
                                openOnFocus
                                autoFocus
                            />
                        </div>
                    </header>

                    {/* Configure component to set Algolia query parameters */}
                    <Configure
                        attributesToSnippet={['name:7', 'description:15']}
                        snippetEllipsisText="…"
                    />

                    {/* Display search results */}
                    <div className="wrapper mt-2 w-full">
                        <div>
                            <Hits hitComponent={Hit} />
                        </div>
                    </div>

                    <CustomSearchPagination />
                </InstantSearch>
            </div>
        </div>
    )
}

export default Registry
