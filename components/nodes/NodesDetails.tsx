import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import { NodesData } from './Nodes'
import nodesLogo from "../../public/images/nodesLogo.svg"
const NodesDetails = () => {
    const router = useRouter()
    const { id } = router.query

    // Find the node object with the matching id
    const node = NodesData.find((node) => node.id === id)
    console.log(node)
    if (!node) {
        return <div>Node not found</div>
    }

    return (
        <div className="text-white max-w-lg p-8 bg-gray-900 rounded-md flex flex-wrap lg:flex-nowrap lg:justify-between lg:gap-4">
            <div className='w-[500px]'>
                <Image
                    src={nodesLogo}
                    alt="icon"
                    width={500}  
                    height={500}
                    className="rounded-md"
                />

            </div>
            <div className="max-w-4xl mx-auto p-6">
                <div className=" shadow rounded-lg">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    TalkingFace
                                </h1>
                                <p className="text-sm text--500">
                                    Version 8.6 · Most recent version
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 my-4">
                            <p className="flex items-center text--600 dark:text--400">
                                <span className="material-icons-outlined text-base">
                                    inventory_2
                                </span>
                                MIT license
                            </p>
                            <p className="flex items-center text--600 dark:text--400">
                                <span className="material-icons-outlined text-base">
                                    star_rate
                                </span>
                                4.8 rating
                            </p>
                            <p className="flex items-center text--600 dark:text--400">
                                <span className="material-icons-outlined text-base">
                                    cloud_download
                                </span>
                                86k downloads
                            </p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold mb-2">
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
                            <h2 className="text-xl font-semibold mb-2">
                                Version history
                            </h2>
                            <div className="space-y-2">
                                <div className="bg-gray-800 p-3 rounded">
                                    <h3 className="font-semibold">
                                        Version 8.6
                                    </h3>
                                    <p className="text-sm text--600 dark:text--400">
                                        Released 4 days ago
                                    </p>
                                    <p className="text-sm text--600 dark:text--400">
                                        Contains various minor bug fixes
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded">
                                    <h3 className="font-semibold">
                                        Version 8.5
                                    </h3>
                                    <p className="text-sm text--600 dark:text--400">
                                        Released November 23, 2023
                                    </p>
                                    <p className="text-sm text--600 dark:text--400">
                                        Contains various minor bug fixes
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded">
                                    <h3 className="font-semibold">
                                        Version 8.4
                                    </h3>
                                    <p className="text-sm text--600 dark:text--400">
                                        Released October 16, 2023
                                    </p>
                                    <p className="text-sm text--600 dark:text--400">
                                        Contains various minor bug fixes
                                    </p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded">
                                    <h3 className="font-semibold">
                                        Version 8.3
                                    </h3>
                                    <p className="text-sm text--600 dark:text--400">
                                        Released September 2, 2023
                                    </p>
                                    <p className="text-sm text--600 dark:text--400">
                                        Contains various minor bug fixes
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <button className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Code Repository
                </button>
                <button className="px-4 py-2 ml-2 text-white bg-gray-700 rounded hover:bg-gray-800">
                    Edit details
                </button>
            </div>
        </div>
    )
}

export default NodesDetails
