import Autocomplete from '@/components/Search/Autocomplete'
import { algoliasearch } from 'algoliasearch'
import singletonRouter from 'next/router'
import React from 'react'
import { Configure, Hits, InstantSearch } from 'react-instantsearch'
import { createInstantSearchRouterNext } from 'react-instantsearch-router-nextjs'
import CustomSearchPagination from '../common/CustomSearchPagination'
import GenericHeader from '../common/GenericHeader'
import Hit from '../Search/SearchHit'

import { INSTANT_SEARCH_INDEX_NAME } from 'src/constants'

// Initialize Algolia search client with custom host and headers
const searchClient = algoliasearch(
    "4E0RO38HS8",
    "684d998c36b67a9a9fce8fc2d8860579",
    {
        hosts: [{
            url: 'search.comfy.org/api/search',
            accept: 'readWrite',
            protocol: 'https'
        }],
        baseHeaders: {
            'X-Algolia-Application-Id': "4E0RO38HS8",
            'X-Algolia-API-Key': "684d998c36b67a9a9fce8fc2d8860579"
        }
    }
)

type RegistryProps = {}

const Registry: React.FC<RegistryProps> = ({}) => {
    return (
        <div className="relative mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Welcome to the Registry"
                subTitle="View nodes or sign in to create and publish your own"
                buttonText="Get Started"
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
                                placeholder="Search Nodes"
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
