import { useNextTranslation } from '@/src/hooks/i18n'
import { useQueryClient } from '@tanstack/react-query'
import download from 'downloadjs'
import { Button, Label, Spinner } from 'flowbite-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { HiTrash } from 'react-icons/hi'
import { MdEdit, MdOpenInNew } from 'react-icons/md'
import analytic from 'src/analytic/analytic'
import {
    NodeVersion,
    NodeVersionStatus,
    useGetNode,
    useGetPermissionOnPublisherNodes,
    useGetUser,
    useListNodeVersions,
    useListPublishersForUser,
} from '@/src/api/generated'
import {
    UNCLAIMED_ADMIN_PUBLISHER_ID,
    REQUEST_OPTIONS_NO_CACHE,
} from 'src/constants'
import nodesLogo from '../../public/images/nodesLogo.svg'
import CopyableCodeBlock from '../CodeBlock/CodeBlock'
import { NodeDeleteModal } from './NodeDeleteModal'
import { NodeEditModal } from './NodeEditModal'
import NodeStatusBadge from './NodeStatusBadge'
import NodeVDrawer from './NodeVDrawer'
import PreemptedComfyNodeNamesEditModal from './PreemptedComfyNodeNamesEditModal'
import SearchRankingEditModal from './SearchRankingEditModal'

export function FormatRelativeDate({ date: dateString }: { date: string }) {
    const { t } = useNextTranslation()
    const date = new Date(dateString)
    const now = new Date()
    const oneDay = 24 * 60 * 60 * 1000 // milliseconds in one day
    const difference = now.getTime() - date.getTime() // difference in milliseconds
    const daysAgo = Math.floor(difference / oneDay)

    if (daysAgo < 7) {
        if (daysAgo === 0) {
            return <>{t('Today')}</>
        } else if (daysAgo === 1) {
            return <>{t('Yesterday')}</>
        } else {
            return <>{t('{{days}} days ago', { days: daysAgo })}</>
        }
    } else {
        // Formatting to YYYY-MM-DD
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        return <>{`${year}-${month}-${day}`}</>
    }
}

const downloadFile = async (url: string, filename: string) => {
    try {
        console.log('downloading file from:', url)
        const response = await fetch(url)
        const blob = await response.blob()
        download(blob, filename, 'application/gzip')
    } catch (error) {
        console.error('Error downloading file:', error)
    }
}

export function formatDownloadCount(count: number): string {
    if (count === 0) return '0'

    const units = ['', 'K', 'M', 'B']
    const unitSize = 1000
    const unitIndex = Math.floor(Math.log10(count) / Math.log10(unitSize))

    // Don't format if less than 1000
    if (unitIndex === 0) return count.toString()

    // Calculate the formatted number with one decimal place
    const formattedNum = (count / Math.pow(unitSize, unitIndex)).toFixed(1)

    // Remove .0 if it exists
    const cleanNum = formattedNum.endsWith('.0')
        ? formattedNum.slice(0, -2)
        : formattedNum

    return `${cleanNum}${units[unitIndex]}`
}

const NodeDetails = () => {
    const { t } = useNextTranslation()
    // state for drawer and modals
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedVersion, setSelectedVersion] = useState<NodeVersion | null>(
        null
    )
    const [isEditModalOpen, setIsEditModal] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isSearchRankingEditModalOpen, setIsSearchRankingEditModalOpen] =
        useState(false)
    const [
        isPreemptedComfyNodeNamesEditModalOpen,
        setIsPreemptedComfyNodeNamesEditModalOpen,
    ] = useState(false)
    // useNodeList
    // parse query parameters from the URL
    // note: publisherId can be undefined when accessing `/nodes/[nodeId]`
    const qc = useQueryClient()
    const router = useRouter()
    const { publisherId: _publisherId, nodeId: _nodeId } = router.query
    const nodeId = String(_nodeId) // nodeId is always string

    // fetch node details and permissions with no-cache headers for real-time data
    const {
        data: node,
        isLoading,
        isError,
    } = useGetNode(nodeId, undefined, {
        request: REQUEST_OPTIONS_NO_CACHE,
    })
    const publisherId = String(node?.publisher?.id ?? _publisherId) // try use _publisherId from url while useGetNode is loading

    const { data: permissions } = useGetPermissionOnPublisherNodes(
        publisherId,
        nodeId
    )

    const { data: user } = useGetUser()
    const isAdmin = user?.isAdmin
    const canEdit = isAdmin || permissions?.canEdit
    const { data: myPublishers } = useListPublishersForUser({})
    const warningForAdminEdit =
        isAdmin && !myPublishers?.map((e) => e.id)?.includes(publisherId) // if admin is editing a node that is not owned by them, show a warning

    const { data: nodeVersions, refetch: refetchVersions, isLoading: isNodeVersionsLoading } =
        useListNodeVersions(
            nodeId as string,
            {
                statuses: [
                    NodeVersionStatus.NodeVersionStatusActive,
                    NodeVersionStatus.NodeVersionStatusPending,
                    NodeVersionStatus.NodeVersionStatusFlagged,
                    // show rejected versions only to publisher
                    ...(!canEdit
                        ? []
                        : [NodeVersionStatus.NodeVersionStatusBanned]),
                ],
            },
            {}
        )

    const isUnclaimed = node?.publisher?.id === UNCLAIMED_ADMIN_PUBLISHER_ID

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

    const handleClaimNode = () => {
        if (!user) {
            router.push(`/auth/login?fromUrl=${router.asPath}`)
            return
        }
        // Redirect to publisher selection page for claiming
        router.push(`/nodes/${nodeId}/claim`)
    }

    // redirect to correct /publishers/[publisherId]/nodes/[nodeId] if publisherId in query is different from the one in node
    // usually this happens when publisher changes, e.g. when user claims a node
    const isPublisherIdMismatchedBetweenURLandNode =
        node && _publisherId && publisherId !== _publisherId
    if (isPublisherIdMismatchedBetweenURLandNode) {
        router.replace(`/publishers/${publisherId}/nodes/${nodeId}`)
        return null // prevent rendering the component while redirecting
    }

    if (isError) {
        // TODO: show error message and allow navigate back to the list
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="" />
            </div>
        )
    }

    if (!node) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-120px)]">
                <section className="text-white bg-gray-900 whitespace-nowrap">
                    <div className="max-w-screen-xl px-4 py-8 mx-auto lg:px-6 lg:py-16">
                        <div className="max-w-screen-sm mx-auto text-center">
                            <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-primary-600 dark:text-primary-500">
                                {t('Node not found')}
                            </h1>
                        </div>
                    </div>
                </section>
            </div>
        )
    }

    return (
        <>
            {/* TODO(sno): unwrap this div out of fragment in another PR */}
            <div className="flex flex-wrap justify-between p-8 text-white bg-gray-900 rounded-md lg:flex-nowrap lg:justify-between lg:gap-12">
                <div className="w-full lg:w-1/5 ">
                    <Image
                        src={node?.icon || nodesLogo}
                        alt="icon"
                        width={240}
                        height={240}
                        layout="fixed"
                        className="rounded-md"
                    />
                </div>
                <div className="w-full mx-auto lg:w-2/3">
                    <div className="rounded-lg shadow ">
                        <div className="">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-[48px] font-bold">
                                        {node.name}
                                    </h1>

                                    <p
                                        className="text-[18px] pt-2 text-gray-300"
                                        hidden={isUnclaimed}
                                    >
                                        {node.publisher?.id?.replace(
                                            /^(?!$)/,
                                            '@'
                                        )}
                                        {node.latest_version && (
                                            <span>
                                                {!!node.publisher?.id && ` | `}
                                                {`v${node.latest_version?.version}`}
                                                <span className="pl-3 text-gray-400">
                                                    {t('Most recent version')}
                                                </span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <NodeStatusBadge status={node.status} />
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
                                )}*/}
                                {/*{data.rating && (
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
                                {node.downloads != 0 && (
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
                                            {formatDownloadCount(
                                                node.downloads || 0
                                            )}{' '}
                                            {t('downloads')}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="mt-5 mb-10">
                                {isUnclaimed || (nodeVersions?.length) ? (
                                    <>
                                        <p className="text-base font-normal text-gray-200">
                                            {
                                                !nodeVersions?.length ? t(
                                                    'This node can only be installed via git, because it has no versions published yet'
                                                ) :t(
                                                "This node can only be installed via git, because it's unclaimed by any publisher"
                                            )}
                                            {node.repository && (
                                                <CopyableCodeBlock
                                                    code={`cd your/path/to/ComfyUI/custom_nodes\ngit clone ${node.repository}`}
                                                />
                                            )}
                                        </p>
                                        {user && (
                                            // TODO: change this button to a small hint like this: "(i) This is my node? [Claim]", and move into [publisher] section above
                                            <Button
                                                color="blue"
                                                className="mt-4 font-bold"
                                                onClick={handleClaimNode}
                                            >
                                                {t('Claim this node')}
                                            </Button>
                                        )}
                                    </>
                                ) 
                                
                                : (
                                    <CopyableCodeBlock
                                        code={`comfy node registry-install ${nodeId}`}
                                    />
                                )}
                            </div>
                            <div>
                                <h2 className="mb-2 text-lg font-bold">
                                    {t('Description')}
                                </h2>
                                <p className="text-base font-normal text-gray-200">
                                    {node.description}
                                </p>
                            </div>
                            <div className="mt-10" hidden={isUnclaimed}>
                                <h2 className="mb-2 text-lg font-semibold">
                                    {t('Version history')}
                                </h2>
                                <div className="w-2/3 mt-4 space-y-3 rounded-3xl">
                                    {nodeVersions?.map((version, index) => (
                                        <div
                                            className=" bg-gray-700 border-gray-500 border p-[32px] rounded-xl "
                                            key={index}
                                        >
                                            <h3 className="text-base font-semibold text-gray-200">
                                                {t('Version')} {version.version}
                                            </h3>
                                            <p className="mt-3 text-sm font-normal text-gray-400 ">
                                                <FormatRelativeDate
                                                    date={
                                                        version.createdAt || ''
                                                    }
                                                />
                                            </p>
                                            <p className="flex-grow mt-3 text-base font-normal text-gray-200 line-clamp-2">
                                                {version.changelog}
                                                <div
                                                    className="text-sm font-normal text-blue-500 cursor-pointer"
                                                    onClick={() =>
                                                        selectVersion(version)
                                                    }
                                                    tabIndex={0}
                                                >
                                                    {t('More')}
                                                </div>
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
                        {node.repository && (
                            <Button
                                className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px]"
                                onClick={(e) => {
                                    analytic.track('View Repository')
                                    e.preventDefault()
                                    window.open(
                                        node.repository,
                                        '_blank',
                                        'noopener noreferrer'
                                    )
                                }}
                                href={node.repository || ''}
                            >
                                <MdOpenInNew className="w-5 h-5 mr-2" />
                                {t('View Repository')}
                            </Button>
                        )}

                        {!!node.latest_version?.downloadUrl && (
                            <Button
                                hidden={isUnclaimed}
                                className="flex-shrink-0 px-4 text-white bg-blue-500 rounded whitespace-nowrap text-[16px]"
                                onClick={(
                                    e: React.MouseEvent<HTMLButtonElement>
                                ) => {
                                    e.preventDefault()
                                    if (node?.latest_version?.downloadUrl) {
                                        downloadFile(
                                            node.latest_version?.downloadUrl,
                                            `${node.name}_${node.latest_version.version}.zip`
                                        )
                                    }
                                    analytic.track(
                                        'Download Latest Node Version'
                                    )
                                }}
                            >
                                <a>{t('Download Latest')}</a>
                            </Button>
                        )}

                        {canEdit && (
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
                                <span>{t('Edit details')}</span>
                                {warningForAdminEdit && (
                                    <>&nbsp;{t('(admin)')}</>
                                )}
                            </Button>
                        )}

                        {canEdit && (
                            <Button
                                className="flex-shrink-0 px-4 flex items-center text-red-300 border-red-300 fill-red-300 bg-gray-700 rounded whitespace-nowrap text-[16px]"
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                <HiTrash className="w-5 h-5 mr-2" />
                                <span>{t('Delete')}</span>
                                {warningForAdminEdit && (
                                    <>&nbsp;{t('(admin)')}</>
                                )}
                            </Button>
                        )}

                        {/* admin zone */}
                        {isAdmin && (
                            <>
                                <hr />

                                {/* Search Ranking: integer from 1 to 10. Lower number means higher search ranking, all else equal */}
                                {null != node.search_ranking && (
                                    <>
                                        <Label
                                            className="flex-shrink-0 px-4 py-2 text-white rounded whitespace-nowrap text-[16px] flex items-center justify-between"
                                            htmlFor="edit-search-ranking"
                                        >
                                            <button
                                                className="mr-2 flex items-center justify-center"
                                                id="edit-search-ranking"
                                                onClick={() => {
                                                    setIsSearchRankingEditModalOpen(
                                                        true
                                                    )
                                                    analytic.track(
                                                        'Edit Search Ranking'
                                                    )
                                                }}
                                            >
                                                <MdEdit className="w-4 h-4 text-white" />
                                            </button>
                                            <div className="flex items-center">
                                                <span>
                                                    {t('Search Ranking')}:{' '}
                                                    {node.search_ranking}
                                                </span>
                                            </div>
                                        </Label>
                                        <SearchRankingEditModal
                                            nodeId={nodeId}
                                            defaultSearchRanking={
                                                node.search_ranking ?? 5
                                            }
                                            open={isSearchRankingEditModalOpen}
                                            onClose={() =>
                                                setIsSearchRankingEditModalOpen(
                                                    false
                                                )
                                            }
                                        />
                                    </>
                                )}

                                {/* Preempted Comfy Node Names management section */}
                                <>
                                    <Label
                                        className="flex-shrink-0 px-4 py-2 text-white rounded whitespace-nowrap text-[16px] flex items-center justify-between"
                                        htmlFor="edit-preempted-comfy-node-names"
                                    >
                                        <button
                                            className="mr-2 flex items-center justify-center"
                                            id="edit-preempted-comfy-node-names"
                                            onClick={() => {
                                                setIsPreemptedComfyNodeNamesEditModalOpen(
                                                    true
                                                )
                                                analytic.track(
                                                    'Edit Preempted Comfy Node Names'
                                                )
                                            }}
                                        >
                                            <MdEdit className="w-4 h-4 text-white" />
                                        </button>
                                        <div className="flex items-center">
                                            <span>
                                                {t('Preempted Names')}:{' '}
                                                <pre className="whitespace-pre-wrap text-xs">
                                                    {node.preempted_comfy_node_names &&
                                                    node
                                                        .preempted_comfy_node_names
                                                        .length > 0
                                                        ? node.preempted_comfy_node_names.join(
                                                              '\n'
                                                          )
                                                        : t('None')}
                                                </pre>
                                            </span>
                                        </div>
                                    </Label>
                                    <PreemptedComfyNodeNamesEditModal
                                        nodeId={nodeId}
                                        defaultPreemptedComfyNodeNames={
                                            node.preempted_comfy_node_names ||
                                            []
                                        }
                                        open={
                                            isPreemptedComfyNodeNamesEditModalOpen
                                        }
                                        onClose={() =>
                                            setIsPreemptedComfyNodeNamesEditModalOpen(
                                                false
                                            )
                                        }
                                    />
                                </>
                            </>
                        )}
                    </div>
                </div>

                <NodeEditModal
                    onCloseEditModal={onCloseEditModal}
                    nodeData={node}
                    openEditModal={isEditModalOpen}
                    publisherId={publisherId}
                />

                <NodeDeleteModal
                    openDeleteModal={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    nodeId={nodeId}
                    publisherId={publisherId}
                />

                {isDrawerOpen && selectedVersion && nodeId && (
                    <NodeVDrawer
                        toggleDrawer={toggleDrawer}
                        isDrawerOpen={isDrawerOpen}
                        nodeId={nodeId}
                        publisherId={publisherId}
                        versionNumber={selectedVersion.version ?? ''}
                        canEdit={canEdit}
                        onUpdate={() => {
                            refetchVersions()
                        }}
                    />
                )}
            </div>
        </>
    )
}

export default NodeDetails
