import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { Button, Spinner } from 'flowbite-react'
import nodesLogo from '../../public/images/nodesLogo.svg'
import NodeVDrawer from './NodeVDrawer'
import Link from 'next/link'
import { NodeEditModal } from './NodeEditModal'
import {
    NodeVersion,
    useGetNode,
    useGetPermissionOnPublisherNodes,
    useListNodeVersions,
} from 'src/api/generated'
import CopyableCodeBlock from '../CodeBlock/CodeBlock'
import analytic from 'src/analytic/analytic'

export function formatRelativeDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000 // milliseconds in one day
    const difference = now.getTime() - date.getTime() // difference in milliseconds
    const daysAgo = Math.floor(difference / oneDay)

    if (daysAgo < 7) {
        if (daysAgo === 0) {
            return 'Today'
        } else if (daysAgo === 1) {
            return 'Yesterday'
        } else {
            return `${daysAgo} days ago`
        }
    } else {
        // Formatting to YYYY-MM-DD
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return `${year}-${month}-${day}`
    }
}

const NodeDetails = () => {
    const router = useRouter()
    const { publisherId, nodeId } = router.query
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState<NodeVersion | null>(
        null
    )
    const { data: permissions } = useGetPermissionOnPublisherNodes(
        publisherId as string,
        nodeId as string
    )
    const [openEditModal, setIsEditModal] = useState(false)
    const { data, isLoading, isError } = useGetNode(nodeId as string)
    const {
        data: nodeVersions,
        isLoading: loadingNodeVersions,
        error: listNodeVersionsError,
    } = useListNodeVersions(nodeId as string)
    const toggleDrawer = () => {
        analytic.track('View Node Version Details')
        setIsDrawerOpen(!isDrawerOpen)
    }

    const selectVersion = (version: NodeVersion) => {
        setSelectedVersion(version)
        setIsDrawerOpen(true)
    }

    const handleOpenModal = () => {
        analytic.track('Edit Node')
        setIsEditModal(true)
    }

    const onCloseEditModal = () => {
        setIsEditModal(false)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
                <section className="text-white bg-gray-900 whitespace-nowrap">
                    <div className="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 lg:py-16">
                        <div className="max-w-screen-sm mx-auto text-center">
                            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-primary-600 dark:text-primary-500">
                                Node not found
                            </h1>
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <>
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
                <div className="w-full mx-auto lg:w-2/3">
                    <div className="rounded-lg shadow ">
                        <div className="">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-[48px] font-bold">
                                        {data.name}
                                    </h1>
                                    {data.latest_version && (
                                        <p className="text-[18px] pt-2 text-gray-300">
                                            v{data.latest_version?.version}
                                            <span className="pl-3 text-gray-400">
                                                {' '}
                                                Most recent version
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col mt-6 mb-6 ">
                                {/* {data.license && (
                                    <p className="flex items-center py-2 mt-1 text-xs text-center text-gray-400">
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
                                    </p>
                                )}
                                {data.rating && (
                                    <p className="flex items-center py-2 mt-1 text-xs text-center text-gray-400 align-center">
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
                                            {data.rating} rating
                                        </span>
                                    </p>
                                )} */}
                                {data.downloads && (
                                    <p className="flex items-center py-2 mt-1 text-xs text-gray-400">
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
                                            {data.downloads} downloads
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="mt-5 mb-10">
                                <CopyableCodeBlock
                                    code={`comfy node registry-install ${nodeId}`}
                                />
                            </div>
                            <div>
                                <h2 className="mb-2 text-lg font-bold">
                                    Description
                                </h2>
                                <p className="text-base font-normal text-gray-200">
                                    {data.description}
                                </p>
                            </div>
                            <div className="mt-10">
                                <h2 className="mb-2 text-lg font-semibold">
                                    Version history
                                </h2>
                                <div className="w-2/3 mt-4 space-y-3 rounded-3xl">
                                    {nodeVersions?.map((version, index) => (
                                        <div
                                            className=" bg-gray-700 border-gray-500 border p-[32px] rounded-xl "
                                            key={index}
                                        >
                                            <h3 className="text-base font-semibold text-gray-200">
                                                Version {version.version}
                                            </h3>
                                            <p className="mt-3 text-sm font-normal text-gray-400 ">
                                                {formatRelativeDate(
                                                    version.createdAt || ''
                                                )}
                                            </p>
                                            <p className="flex-grow mt-3 text-base font-normal text-gray-200 line-clamp-2">
                                                {version.changelog}
                                                <span
                                                    className="text-sm font-normal text-blue-500 cursor-pointer"
                                                    onClick={() =>
                                                        selectVersion(version)
                                                    }
                                                >
                                                    <a>More</a>
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full mt-4 lg:w-1/6 ">
                    <div className="flex flex-col gap-4">
                        {data.repository && (
                            <Button
                                className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px]"
                                onClick={() => {
                                    analytic.track('View Repository')
                                }}
                            >
                                <a
                                    href={data.repository || ''}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Repository
                                </a>
                            </Button>
                        )}

                        {permissions?.canEdit && (
                            <Button
                                className="flex-shrink-0 px-4  flex items-center text-white bg-gray-700 rounded whitespace-nowrap text-[16px]"
                                onClick={handleOpenModal}
                            >
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
                        )}
                        {data.latest_version?.downloadUrl && (
                            <Button
                                className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px]"
                                onClick={() =>
                                    analytic.track(
                                        'Download Latest Node Version'
                                    )
                                }
                            >
                                <Link href={data.latest_version?.downloadUrl}>
                                    Download Latest
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <NodeEditModal
                    onCloseEditModal={onCloseEditModal}
                    nodeData={data}
                    openEditModal={openEditModal}
                    publisherId={publisherId as string}
                />

                {isDrawerOpen && selectedVersion && nodeId && (
                    <NodeVDrawer
                        version={selectedVersion}
                        toggleDrawer={toggleDrawer}
                        isDrawerOpen={isDrawerOpen}
                        nodeId={nodeId as string}
                        publisherId={publisherId as string}
                        canEdit={permissions?.canEdit}
                    />
                )}
            </div>
        </>
    )
}

export default NodeDetails
