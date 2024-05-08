import React, { useState } from 'react'

import GenericHeader from '../common/GenericHeader'
import NodesCard from './NodesCard'

export const NodesData = [
    {
        id: '1',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '2',
        name: 'Face',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '3',
        name: 'Face',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '4',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k',
    },
    {
        id: '5',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '6',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '7',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '8',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
    {
        id: '9',
        version: 'v4.0',
        name: 'TalkingFace',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/Image.png',
        rating: '4.8 ',
        downloads: '977k ',
    },
]
const Nodes: React.FC = () => {
    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <GenericHeader
                title="Your nodes"
                subTitle="View and edit your nodes and publishers"
                buttonText="New Publisher"
                buttonLink=""
            />
            {/* <FilterRegistry /> */}
            <div className="grid gap-4 mb-6 lg:mb-5 md:grid-cols-3 xl:grid-cols-4">
                {NodesData.map((member, index) => (
                    <NodesCard key={index} {...member} />
                ))}
            </div>
        </section>
    )
}

export default Nodes
