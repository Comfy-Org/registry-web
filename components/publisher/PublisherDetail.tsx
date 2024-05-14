import { Button } from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { PublisherModal } from './PublisherModal'
import { EditPublisherModal } from './EditPublisherModal'
import CreatePublisherKey from './CreatePublisherKey'
import GeneratedPublisherKey from './GeneratedPublisherKey'

const PublisherDetail = () => {
    const router = useRouter()
    const { id } = router.query
    const [openModal, setOpenModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false) // State for controlling the EditPublisherModal
    const [keyGenerated, setKeyGenerated] = useState(false)

    const [email, setEmail] = useState('')

    const handleCreateButtonClick = () => {
        setOpenModal(true)
    }

    const onCloseModal = () => {
        setOpenModal(false)
        setEmail('')
    }
    const handleEditButtonClick = () => {
        setOpenEditModal(true)
    }
    const onCloseEditModal = () => {
        setOpenEditModal(false)
    }
    // // Find the node object with the matching id
    // const node = NodesData.find((node) => node.id === id)
    // console.log(node)
    // if (!node) {
    //     return <div>Node not found</div>
    // }

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
                    onClick={() => router.push("/nodes")}
                >
                  <span>
                    Back to your nodes</span>
                </span>
            </div>

            <div>
                <div className="flex justify-between">
                    <h1 className="mb-4 text-5xl font-bold text-white">
                        Nodes Makers
                    </h1>
                    <Button
                        size="xs"
                        className="h-8 p-2 px-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                        color="blue"
                        onClick={handleEditButtonClick}
                    >
                        <svg
                            className="w-5 h-5 text-white"
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
                                d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                            />
                        </svg>
                        <span className="text-[10px]">Edit details</span>
                    </Button>
                </div>
                <p className="text-gray-400">@nodesmakers</p>
                <div className="flex flex-col my-4 ">
                    <p className="flex items-center mt-1 text-xs text-center text-gray-400">
                        <svg
                            className="w-5 h-5 text-white"
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
                        <span className="ml-2">0 nodes</span>
                    </p>
                    <p className="flex items-center mt-1 text-xs text-center text-gray-400 align-center">
                        <svg
                            className="w-5 h-5 text-white"
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
                                d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                        </svg>
                        <span className="ml-2">Robin Huang, Yoland Yan</span>
                    </p>
                    <p className="flex items-center mt-1 text-xs text-gray-400">
                        <svg
                            className="w-5 h-5 text-white"
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
                        </svg>{' '}
                        <span className="ml-2">Created 5/20/24</span>
                    </p>
                </div>
                {!keyGenerated && (
                    <CreatePublisherKey
                        handleCreateButtonClick={handleCreateButtonClick}
                    />
                )}
                {keyGenerated && <GeneratedPublisherKey />}
                <div className="mt-12">
                    <h2 className="mb-2 text-xl font-semibold text-white ">
                        Your nodes
                    </h2>
                    <p className="text-xs text-gray-400">
                        No nodes created yet. Please create nodes from your CLI.
                    </p>
                </div>
            </div>
            <PublisherModal
                openModal={openModal}
                onCloseModal={onCloseModal}
                setKeyGenerated={setKeyGenerated}
            />
            <EditPublisherModal
                openModal={openEditModal} // Pass the state to the EditPublisherModal
                onCloseModal={onCloseEditModal} // Pass the closing function to the EditPublisherModal
            />
        </div>
    )
}

export default PublisherDetail
