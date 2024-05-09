import React, { useEffect } from 'react'

import FilterRegistry from './FilterRegistry'
import GenericHeader from '../common/GenericHeader'
import RegistryCard from './RegistryCard'
import { useListAllNodes } from '../../src/api/generated'
export const NodesData = [
    {
        id: '1',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '2',
        name: 'Face',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '3',
        name: 'Face',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '4',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '5',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '6',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '8',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '9',
        name: 'TalkingFace',
        version: 'v4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/nodelogo2.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
]
const Registry: React.FC = () => {
    const {
        data: getAllNodesData,
        isLoading,
        isError,
    } = useListAllNodes({
        page: 1,
        limit: 15,
    })

    useEffect(() => {
        console.log('------------', getAllNodesData)
    }, [getAllNodesData])

    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Welcome to the Registry"
                subTitle="View nodes or sign in to create and publish your own"
                buttonText="Get Started"
                buttonLink=""
            />
            <FilterRegistry />
            <div className="grid gap-4 mb-6 lg:mb-5 md:grid-cols-3 xl:grid-cols-4">
                {NodesData.map((member, index) => (
                    <RegistryCard key={index} {...member} />
                ))}
                {/* {NodesData?.map((node, index) => {
                    console.log('--------------0', node)
                    return (
                        <RegistryCard
                            version={''}
                            image={node.image}
                            rating={''}
                            downloads={''}
                            key={index}
                            name={node?.name}
                            id={node?.id}
                            license={node?.license}
                            description={node?.description}
                        />
                    )
                })} */}
            </div>
        </section>
    )
}

export default Registry
