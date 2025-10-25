import React from 'react'
import GenericHeader from '@/components/common/GenericHeader'
import { useNextTranslation } from '@/src/hooks/i18n'

/**
 * A simplified version of the Registry component for Storybook
 * This avoids dependency issues with Algolia and Next.js router
 */
const RegistryStory: React.FC = () => {
    const { t } = useNextTranslation()
    return (
        <div className="relative mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Welcome to ComfyUI Registry"
                subTitle="View nodes or sign in to create and publish your own"
                buttonText="Get Started"
                buttonLink="/nodes"
            />

            <div className="md:w-full w-full mt-5">
                <header className="header">
                    <div className="header-wrapper wrapper">
                        <div className="search-input-container">
                            <input
                                type="text"
                                className="search-input w-full p-4 rounded bg-gray-800 text-white border border-gray-700"
                                placeholder="Search Nodes (Storybook preview)"
                            />
                        </div>
                    </div>
                </header>

                <div className="wrapper mt-2 w-full">
                    <div className="p-4 border border-gray-700 rounded mt-4 bg-gray-800 text-white">
                        <h3 className="text-xl font-bold">
                            {t('Example Node', 'Example Node')}
                        </h3>
                        <p className="text-gray-400 mt-2">
                            {t(
                                'This is a placeholder for search results that would appear in the actual component',
                                'This is a placeholder for search results that would appear in the actual component'
                            )}
                            .
                        </p>
                    </div>
                    <div className="p-4 border border-gray-700 rounded mt-4 bg-gray-800 text-white">
                        <h3 className="text-xl font-bold">
                            {t('Another Example Node', 'Another Example Node')}
                        </h3>
                        <p className="text-gray-400 mt-2">
                            {t(
                                'In the real application, these would be dynamically loaded from Algolia search',
                                'In the real application, these would be dynamically loaded from Algolia search'
                            )}
                            .
                        </p>
                        <span>
                            {t('test catch ui change', 'test catch ui change')}
                        </span>
                    </div>
                </div>

                <div className="pagination flex justify-center mt-6 mb-8">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded mr-2">
                        {t('Previous', 'Previous')}
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded">
                        {t('Next', 'Next')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegistryStory
