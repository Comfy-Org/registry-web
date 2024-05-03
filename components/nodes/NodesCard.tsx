import React, { useState } from 'react'
import CardNodes from '../common/Card'
import NodesHeader from './NodesHeader'
import FilterNodes from './FIlterNodes'
export const NodesData = [
    {
        id: '1',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '2',
        name: 'Face',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '3',
        name: 'Face',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '4',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '5',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '6',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '8',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '9',
        name: 'TalkingFace',
        version: '4.0',
        license: 'AB12345',
        description: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
]
const Nodes: React.FC = () => {
    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <NodesHeader />
            <FilterNodes />
            <div className="grid gap-4 mb-6 lg:mb-5 md:grid-cols-3 xl:grid-cols-4">
                {NodesData.map((member, index) => (
                    <CardNodes key={index} {...member} />
                ))}
            </div>
        </section>
    )
}

export default Nodes
