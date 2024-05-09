import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState,useEffect } from 'react'
import { NodesData } from './Nodes'
import { Button } from 'flowbite-react'
import nodesLogo from '../../public/images/nodesLogo.svg'
import NodeVDrawer from './NodeVDrawer'
import Link from 'next/link'
const versionData = {
    versions: [
        {
            name: 'Version 8.6',
            description:
                ' Contains various minor bug fixes',
            created: 'Released 1 days ago.',
        },
        {
            name: 'Version 8.5',
            description:
                ' Contains various minor bug fixes',
            created: 'Released 2 days ago.',
        },
        {
            name: 'Version 8.4',
            description:
                ' Contains various minor bug fixes,Improved flow',
            created: 'Released 3 days ago.',
        },
        {
            name: 'Version 8.3',
            description:
                ' Contains various minor bug fixes,Improved flow',
            created: 'Released 4 days ago.',
        },
        {
            name: 'Version 8.2',
            description:
                ' Contains various minor bug fixes,Improved flow',
            created: 'Released 5 days ago.',
        },
    ],
}

const NodesDetails = () => {
    const router = useRouter()
    const { id } = router.query
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState(null)
    const [openEditModal, setIsEditModal] = useState(false)
    const [nodeData, setNodeData] = useState(null)
    const toggleDrawer = (version) => {
        setSelectedVersion(version)
        setIsDrawerOpen(!isDrawerOpen)
    }
  
    const handleOpenModal = () => {
        setIsEditModal(true)
    }

    const onCloseEditModal = () => {
        setIsEditModal(false)
    }

    const node = NodesData.find((node) => node.id === id)
    console.log(node)
    if (!node) {
        return <div>Node not found</div>
    }
    useEffect(() => {
        // Find the node with the matching id
        const node = NodesData.find((node) => node.id === id)
        console.log('-----------------------------------', node)
        if (node) {
            // Set the node data
            setNodeData(node)
        } else {
            // Node not found, handle accordingly
            console.error('Node not found')
        }
    }, [id])
    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <Button
                    className="text-gray-400 bg-transparent border-none hover:!bg-transparent hover:!border-none focus:!bg-transparent focus:!border-none focus:!outline-none"
                    onClick={() => router.back()}
                >
                    <svg
                        className="w-5 h-5 text-gray-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m15 19-7-7 7-7"
                        />
                    </svg>
                    <span className="pl-1 text-[16px]">
                        {' '}
                        Back to your nodes
                    </span>
                </Button>
            </div>
            <div className="flex flex-wrap justify-between p-8 text-white bg-gray-900 rounded-md lg:flex-nowrap lg:justify-between lg:gap-12">
                <div className="w-full lg:w-1/6 ">
                    <Image
                        src={nodesLogo}
                        alt="icon"
                        width={240}
                        height={240}
                        className="rounded-md"
                    />
                </div>
                <div className="w-full lg:w-2/3 mx-auto">
                    <div className="rounded-lg shadow ">
                        <div className="">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-[48px] font-bold">
                                        TalkingFace
                                    </h1>
                                    <p className="text-[18px] pt-2 text-gray-300">
                                        Version 8.6{' '}
                                        <span className="text-gray-400 pl-3">
                                            {' '}
                                            Most recent version
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col mt-6 mb-10 ">
                                <p className="flex items-center mt-1 text-xs text-center text-gray-400 py-2">
                                    <svg
                                        className="w-6 h-6 "
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-width="2"
                                            d="M4.37 7.657c2.063.528 2.396 2.806 3.202 3.87 1.07 1.413 2.075 1.228 3.192 2.644 1.805 2.289 1.312 5.705 1.312 6.705M20 15h-1a4 4 0 0 0-4 4v1M8.587 3.992c0 .822.112 1.886 1.515 2.58 1.402.693 2.918.351 2.918 2.334 0 .276 0 2.008 1.972 2.008 2.026.031 2.026-1.678 2.026-2.008 0-.65.527-.9 1.177-.9H20M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                    </svg>

                                    <span className="ml-4 text-[18px]">
                                        MIT license
                                    </span>
                                </p>
                                <p className="flex items-center mt-1 text-xs text-center text-gray-400 align-center  py-2">
                                    <svg
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-width="2"
                                            d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.03 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 20.8c-.764.446-1.688-.248-1.474-1.106l1.03-4.119A1 1 0 0 0 6.8 14.56l-3.33-2.723c-.698-.571-.342-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z"
                                        />
                                    </svg>

                                    <span className="ml-4 text-[18px]">
                                        4.8 rating
                                    </span>
                                </p>
                                <p className="flex items-center mt-1 text-xs text-gray-400  py-2">
                                    <svg
                                        className="w-6 h-6"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke="currentColor"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                                        />
                                    </svg>
                                    <span className="ml-4 text-[18px]">
                                        96k downloads
                                    </span>
                                </p>
                            </div>
                            <div>
                                <h2 className="mb-2 text-xl font-bold">
                                    Description
                                </h2>
                                <p className="text-lg font-normal text-gray-200">
                                    Lorem ipsum dolor sit amet, consectetur
                                    adipiscing elit, sed do eiusmod tempor
                                    incididunt ut labore et dolore magna aliqua.
                                    Ipsum tempor incididunt ut labore et dolore
                                    magna aliqua. Lorem ipsum dolor sit amet,
                                    consectetur adipiscing elit, sed do eiusmod
                                    tempor incididunt ut labore et dolore magna
                                    aliqua.
                                </p>
                            </div>
                            <div className="mt-10">
                                <h2 className="mb-2 text-xl font-semibold">
                                    Version history
                                </h2>
                                <div className="w-2/3 space-y-3 mt-4 rounded-3xl">
                                    {versionData.versions.map(
                                        (version, index) => (
                                            <div
                                                className=" bg-gray-800 border-gray-700 border p-[32px] rounded-xl "
                                                key={index}
                                            >
                                                <h3 className="text-2xl font-semibold text-gray-200">
                                                    {version.name}
                                                </h3>
                                                <p className="mt-3 text-lg font-normal text-gray-400 ">
                                                    {version.created}
                                                </p>{' '}
                                                <p className="mt-3 text-lg font-normal flex-grow line-clamp-2 text-gray-200">
                                                    {version.description}{' '}
                                                    <span
                                                        className="text-blue-500 text-lg font-normal  cursor-pointer"
                                                        onClick={() =>
                                                            toggleDrawer(
                                                                version
                                                            )
                                                        }
                                                    >
                                                        <a>More</a>
                                                    </span>
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 w-full lg:w-1/6 ">
                    <div className="flex flex-col gap-4">
                        <Button className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px]">
                            View Repository
                        </Button>

                        <Button className="flex-shrink-0 px-4  flex items-center text-white bg-gray-700 rounded whitespace-nowrap text-[16px]" onClick={handleOpenModal}>
                            <svg
                                className="w-5 h-5 mr-2 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                                />
                            </svg>
                            <span>Edit details</span>
                        </Button>
                    </div>
                </div>
                <NodeEditModal
                    onCloseEditModal={onCloseEditModal}
                    nodeData={nodeData}
                    openEditModal={openEditModal}
                />

                {isDrawerOpen && (
                    <NodeVDrawer
                        version={selectedVersion}
                        toggleDrawer={toggleDrawer}
                        isDrawerOpen={isDrawerOpen}
                    />
                )}
            </div>
        </>
    )
}

export default NodesDetails
