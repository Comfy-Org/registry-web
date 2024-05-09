import React, { useEffect, useState } from 'react'

import FilterRegistry from './FilterRegistry'
import GenericHeader from '../common/GenericHeader'
import RegistryCard from './RegistryCard'
import { useListAllNodes } from '../../src/api/generated'
import { CustomPagination } from '../common/CustomPagination'
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
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const limit = 9
    // const {
    //     data: getAllNodesData,
    //     isLoading,
    //     isError,
    // } = useListAllNodes({
    //     page: 1,
    //     limit: 15,
    // })

    // useEffect(() => {
    //     console.log('------------', getAllNodesData)
    // }, [getAllNodesData])
    useEffect(() => {
        const totalCount = NodesData.length
        setTotalPages(Math.ceil(totalCount / limit))
    }, [])

    const onPageChange = (page: number) => {
        setCurrentPage(page)
    }

    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit

    const currentNodes = NodesData.slice(startIndex, endIndex)

    return (
        <section className="relative h-full mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Welcome to the Registry"
                subTitle="View nodes or sign in to create and publish your own"
                buttonText="Get Started"
                buttonLink="/nodes"
            />
            {/* {/* <FilterRegistry /> */} */}
            <div className="grid gap-4 pt-20 mb-6 lg:mb-5 md:grid-cols-3 xl:grid-cols-4">
                {currentNodes.map((member, index) => (
                    <RegistryCard key={index} {...member} isLoggedIn={false} />
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
            <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                style={{
                    position: 'fixed',
                    bottom: 30,
                    right: '0%',
                    transform: 'translateX(-50%)',
                }}
            />
        </section>
    )
}

export default Registry
