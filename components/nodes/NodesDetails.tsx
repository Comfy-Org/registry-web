import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
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
                ' Contains various minor bug fixes,Improved flow,Fixed issue',
            created: 'Released 1 days ago.',
        },
        {
            name: 'Version 8.5',
            description:
                ' Contains various minor bug fixes,Improved flow,Fixed issue',
            created: 'Released 2 days ago.',
        },
        {
            name: 'Version 8.4',
            description:
                ' Contains various minor bug fixes,Improved flow,Fixed issue',
            created: 'Released 3 days ago.',
        },
        {
            name: 'Version 8.3',
            description:
                ' Contains various minor bug fixes,Improved flow,Fixed issue',
            created: 'Released 4 days ago.',
        },
        {
            name: 'Version 8.2',
            description:
                ' Contains various minor bug fixes,Improved flow,Fixed issue',
            created: 'Released 5 days ago.',
        },
    ],
}

const NodesDetails = () => {
    const router = useRouter()
    const { id } = router.query
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState(null)
    const toggleDrawer = (version) => {
        setSelectedVersion(version)
        setIsDrawerOpen(!isDrawerOpen)
    }

    const node = NodesData.find((node) => node.id === id)
    console.log(node)
    if (!node) {
        return <div>Node not found</div>
    }

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
            <div className="flex flex-wrap max-w-lg p-8 text-white bg-gray-900 rounded-md lg:flex-nowrap lg:justify-between lg:gap-4">
                <div className="w-[500px]">
                    <Image
                        src={nodesLogo}
                        alt="icon"
                        width={500}
                        height={500}
                        className="rounded-md"
                    />
                </div>
                <div className="max-w-4xl p-6 mx-auto">
                    <div className="rounded-lg shadow ">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold">
                                        TalkingFace
                                    </h1>
                                    <p className="text-sm text--500">
                                        Version 8.6 · Most recent version
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center my-4 space-x-4">
                                <p className="flex items-center text--600 dark:text--400">
                                    <span className="text-base material-icons-outlined">
                                        inventory_2
                                    </span>
                                    MIT license
                                </p>
                                <p className="flex items-center text--600 dark:text--400">
                                    <span className="text-base material-icons-outlined">
                                        star_rate
                                    </span>
                                    4.8 rating
                                </p>
                                <p className="flex items-center text--600 dark:text--400">
                                    <span className="text-base material-icons-outlined">
                                        cloud_download
                                    </span>
                                    86k downloads
                                </p>
                            </div>
                            <div>
                                <h2 className="mb-2 text-xl font-semibold">
                                    Description
                                </h2>
                                <p className="text--700 dark:text--300">
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
                            <div className="mt-6">
                                <h2 className="mb-2 text-xl font-semibold">
                                    Version history
                                </h2>
                                <div className="w-2/3 space-y-3 rounded-3xl">
                                    {versionData.versions.map(
                                        (version, index) => (
                                            <div
                                                className="p-3 bg-gray-800 rounded "
                                                key={index}
                                            >
                                                <h3 className="mt-3 text-sm font-semibold text-gray-200">
                                                    {version.name}
                                                </h3>
                                                <p className="mt-3 text-xs text-gray-400 ">
                                                    {version.created}
                                                </p>{' '}
                                                <p className="mt-3 text-xs text-gray-200">
                                                    {version.description}{' '}
                                                    <span
                                                        className="text-blue-500 cursor-pointer"
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
                <div className="mt-4 flex items-center">
                    <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                        View Repository
                    </button>
                    <button className="px-4 py-2 ml-2 flex items-center text-white bg-gray-700 rounded hover:bg-gray-800">
                        <svg
                            className="w-[28px] h-[28px] text-white flex-shrink-0"
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
                        <span className="ml-2">Edit details</span>
                    </button>
                </div>

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
