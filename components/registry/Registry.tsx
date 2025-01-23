import React from 'react'
import GenericHeader from '../common/GenericHeader'
import CustomSearchPagination from '../common/CustomSearchPagination'
import { Node } from 'src/api/generated'
import algoliasearch from 'algoliasearch/lite'
import { Configure, Hits, InstantSearch } from 'react-instantsearch'
import Autocomplete from '@/components/Search/Autocomplete'
import Hit from '../Search/SearchHit'

import { INSTANT_SEARCH_INDEX_NAME } from 'src/constants'

// Initialize Algolia search client
const searchClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID as string,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY as string
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
                    routing={
                        {
                            history: {
                                cleanUrlOnDispose: false,
                            },
                        } as any
                    }
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
                    <div className="container wrapper mt-2">
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
