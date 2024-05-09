import { Button } from 'flowbite-react'
import NodesCard from './NodesCard'
import { useRouter } from 'next/router'
import React from 'react'

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
const NodesPublisherDetail: React.FC = () => {
    const router = useRouter()

    const repeatedNodes = Array(3).fill(NodesData[0])
    return (
        <div className="container p-6 mx-auto h-[90vh]">
            <div className="flex items-center cursor-pointer  mb-8">
                <svg
                    className="w-4 h-4 text-gray-400 "
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
                        d="m15 19-7-7 7-7"
                    />
                </svg>
                <span
                    className="text-gray-400 pl-1 text-base  bg-transparent border-none hover:!bg-transparent hover:!border-none focus:!bg-transparent focus:!border-none focus:!outline-none"
                    onClick={() => router.push('/')}
                >
                    <span>Back to Registry</span>
                </span>
            </div>

            <div>
                <div className="flex justify-between">
                    <h1 className="mb-4 text-[48px] font-bold text-white">
                        Nodes Makers
                    </h1>
                </div>
                <p className="text-gray-400 text-[20px]">@nodesmakers</p>
                <div className="flex flex-col my-4 ">
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
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a4 4 0 0 1-4 4h-1a3 3 0 0 0-3 3"
                            />
                        </svg>
                        <span className="ml-4 text-[18px]">8 nodes</span>
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
                                d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 @0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                        <span className="ml-4 text-[18px]">
                            Robin Huang, Yoland Yan
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
                                d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"
                            />
                        </svg>
                        <span className="ml-4 text-[18px]">
                            Created 5/20/24
                        </span>
                    </p>
                </div>

                <div className="mt-12">
                    <h2 className="mb-2 text-xl font-semibold text-white text-[20px]">
                        Your nodes
                    </h2>
                </div>
                <div className="grid gap-4 pt-8 mb-6 lg:mb-5 md:grid-cols-2 lg:grid-cols-3">
                    {repeatedNodes.map((member, index) => (
                        <NodesCard key={index} {...member} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default NodesPublisherDetail
