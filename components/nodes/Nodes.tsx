import React, { useState } from 'react'
import GenericHeader from '../common/GenericHeader'
import NodesCard from './NodesCard'
import { NodeEditPublishModal } from './NodeEditPublishModal'

import { NodeEditMarkerModal } from './NodeEditMarkerModal'
export const NodesData = [
    {
        id: '1',
        name: 'TalkingFace',
        version: 'v4.0',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque dictum, odio lobortis ultricies interdum, urna lorem fermentum libero, vel accumsan magna purus a lacus. ',
        node: 'Node Publishing, Inc.',
        image: '/images/nodesLogo.svg',
        rating: '4.8 ',
        downloads: '977k ',
    },
]
const repeatedNodes = Array(6).fill(NodesData[0])
const publishingNodes = Array(3).fill(NodesData[0])
const Nodes: React.FC = () => {
    const [openEditModal, setOpenEditModal] = useState(false)
    const [openEditMarkerModal, setOpenEditMarkerModal] = useState(false)

    const onCloseEditModal = () => {
        setOpenEditModal(false)
    }
    const handleEditButtonClick = () => {
        setOpenEditModal(true)
    }

    const onCloseEditMarkerModal = () => {
        setOpenEditMarkerModal(false)
    }
    const handleEditMarkerButtonClick = () => {
        setOpenEditMarkerModal(true)
    }
    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <div>
                <GenericHeader
                    title="Your nodes"
                    subTitle="View and edit your nodes and publishers."
                    buttonText="New Publisher"
                    buttonLink=""
                    showIcon={true}
                    buttonColor=""
                />
            </div>
            {/* <FilterRegistry /> */}
            <div className="pt-20">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl">
                        NodeMaker
                    </h1>

                    <div onClick={handleEditMarkerButtonClick}>
                        <svg
                            className="w-[20px] h-[17px] text-white ml-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                            />
                        </svg>
                    </div>
                </div>

                <div className="grid gap-4 pt-8 mb-6 lg:mb-5 md:grid-cols-2 lg:grid-cols-3">
                    {repeatedNodes.map((member, index) => (
                        <NodesCard key={index} {...member} type="marker" />
                    ))}
                </div>
            </div>
            <div className="pt-5">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold leading-tight tracking-tight text-white sm:text-2xl">
                        Publishing Org
                    </h1>

                    <div onClick={handleEditButtonClick}>
                        <svg
                            className="w-[20px] h-[17px] text-white ml-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="10"
                            height="10"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28"
                            />
                        </svg>
                    </div>
                </div>

                <div className="grid gap-4 pt-8 mb-6 lg:mb-5 md:grid-cols-2 lg:grid-cols-3">
                    {publishingNodes.map((member, index) => (
                        <NodesCard key={index} {...member} type="publisher" />
                    ))}
                </div>
            </div>
            <NodeEditPublishModal
                openModal={openEditModal}
                onCloseModal={onCloseEditModal}
            />
            <NodeEditMarkerModal
                openModal={openEditMarkerModal}
                onCloseModal={onCloseEditMarkerModal}
            />
        </section>
    )
}

export default Nodes
