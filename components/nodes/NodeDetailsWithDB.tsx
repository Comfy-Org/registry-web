import { useNextTranslation } from '@/src/hooks/i18n'
import { useQueryClient } from '@tanstack/react-query'
import download from 'downloadjs'
import { Button, Label, Spinner } from 'flowbite-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { ReactNode, useState, useEffect } from 'react'
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
import nodesLogo from '@/src/assets/images/nodesLogo.svg'
import CopyableCodeBlock from '../CodeBlock/CodeBlock'
import { NodeDeleteModal } from './NodeDeleteModal'
import { NodeEditModal } from './NodeEditModal'
import NodeStatusBadge from './NodeStatusBadge'
import NodeVDrawer from './NodeVDrawer'
import PreemptedComfyNodeNamesEditModal from './PreemptedComfyNodeNamesEditModal'
import SearchRankingEditModal from './SearchRankingEditModal'
import { intlFormatDistance } from 'date-fns'
import { FormatRelativeDate, formatDownloadCount } from './NodeDetails'

// TanStack DB imports
import {
    useNodeLive,
    useNodeVersionsLive,
    useNodeMutation,
} from '@/src/db/hooks'
import { dbSync } from '@/src/db/sync'
import { useComfyDB } from '@/src/db/provider'

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

const NodeDetailsWithDB = () => {
    const { t, i18n } = useNextTranslation()
    const router = useRouter()
    const queryClient = useQueryClient()
    const { db, isInitialized } = useComfyDB()

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

    const nodeId = router.query.id as string

    // Use TanStack DB live query for real-time node updates
    const liveNode = useNodeLive(nodeId)
    const liveVersions = useNodeVersionsLive(nodeId)
    const { updateNode } = useNodeMutation()

    // Still use React Query for initial data fetch and sync with DB
    const { data: apiNode, isLoading: nodeLoading } = useGetNode(nodeId, {
        // @ts-ignore
        ...REQUEST_OPTIONS_NO_CACHE,
    })

    const { data: apiVersions, isLoading: versionsLoading } =
        useListNodeVersions(
            nodeId,
            {
                limit: 50,
                status: NodeVersionStatus.active,
            },
            {
                query: {
                    enabled: !!nodeId,
                    // @ts-ignore
                    ...REQUEST_OPTIONS_NO_CACHE,
                },
            }
        )

    // Sync API data to TanStack DB
    useEffect(() => {
        if (apiNode && isInitialized) {
            dbSync.syncNode(apiNode).then(() => {
                // Track view activity
                const userId = sessionStorage.getItem('userId')
                if (userId) {
                    dbSync.trackActivity(userId, 'view', nodeId, 'node', {
                        nodeName: apiNode.name,
                        timestamp: Date.now(),
                    })
                }
            })
        }
    }, [apiNode, isInitialized, nodeId])

    useEffect(() => {
        if (apiVersions?.data && isInitialized) {
            dbSync.syncNodeVersions(apiVersions.data)
        }
    }, [apiVersions, isInitialized])

    // Use live data if available, fallback to API data
    const node = liveNode || apiNode
    const versions = liveVersions?.length > 0 ? liveVersions : apiVersions?.data

    const {
        data: userData,
        isSuccess: userLoaded,
        isLoading: userLoading,
    } = useGetUser()

    const { data: publishers } = useListPublishersForUser(
        userData?.id ?? '',
        {},
        {
            query: {
                enabled: userLoaded,
            },
        }
    )

    const { data: permission } = useGetPermissionOnPublisherNodes(
        node?.publisher?.id ?? '',
        {
            query: {
                enabled: node?.publisher?.id !== undefined,
            },
        }
    )

    const handleOpenDrawer = (version: NodeVersion) => {
        setSelectedVersion(version)
        setIsDrawerOpen(true)
    }

    const handleDownload = async (version: NodeVersion) => {
        if (!version.download_url) {
            console.error('No download URL available for this version')
            return
        }

        const filename = `${node?.name}_v${version.version}.tar.gz`
        await downloadFile(version.download_url, filename)

        // Track download activity with optimistic update
        if (node) {
            await updateNode(node.id, {
                total_downloads: (node.total_downloads || 0) + 1,
            })

            const userId = sessionStorage.getItem('userId')
            if (userId) {
                await dbSync.trackActivity(
                    userId,
                    'download',
                    node.id,
                    'node',
                    {
                        version: version.version,
                        timestamp: Date.now(),
                    }
                )
            }
        }

        analytic.track('Download Node', {
            nodeId: node?.id,
            nodeName: node?.name,
            nodeAuthor: node?.author,
            version: version.version,
        })
    }

    const handleInstall = async () => {
        if (node) {
            const userId = sessionStorage.getItem('userId')
            if (userId) {
                await dbSync.trackActivity(userId, 'install', node.id, 'node', {
                    timestamp: Date.now(),
                })
            }

            analytic.track('Install Node', {
                nodeId: node.id,
                nodeName: node.name,
                nodeAuthor: node.author,
            })
        }
    }

    const isLoading = nodeLoading || versionsLoading || !isInitialized

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner size="xl" />
            </div>
        )
    }

    if (!node) {
        return <div>{t('Node not found')}</div>
    }

    const canEdit =
        permission?.write === true ||
        publishers?.data?.some(
            (p: any) => p.id === UNCLAIMED_ADMIN_PUBLISHER_ID
        )

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Node Header with Live Updates */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        {node.icon ? (
                            <Image
                                src={node.icon}
                                alt={node.name}
                                width={64}
                                height={64}
                                className="rounded-lg"
                            />
                        ) : (
                            <Image
                                src={nodesLogo}
                                alt={node.name}
                                width={64}
                                height={64}
                                className="rounded-lg"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">{node.name}</h1>
                            {node.author && (
                                <p className="text-gray-600">
                                    {t('by {{author}}', {
                                        author: node.author,
                                    })}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <NodeStatusBadge deprecated={node.deprecated} />
                                {/* Live download count */}
                                <span className="text-sm text-gray-500">
                                    {formatDownloadCount(
                                        node.total_downloads || 0
                                    )}{' '}
                                    {t('downloads')}
                                </span>
                                {/* Live rating */}
                                {node.rating && (
                                    <span className="text-sm text-gray-500">
                                        ⭐ {node.rating.toFixed(1)} (
                                        {node.rating_count})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {canEdit && (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => setIsEditModal(true)}
                                color="gray"
                            >
                                <MdEdit className="mr-1" />
                                {t('Edit')}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setIsDeleteModalOpen(true)}
                                color="failure"
                            >
                                <HiTrash className="mr-1" />
                                {t('Delete')}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Description */}
                {node.description && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            {t('Description')}
                        </h2>
                        <p className="text-gray-700">{node.description}</p>
                    </div>
                )}

                {/* Installation */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">
                        {t('Installation')}
                    </h2>
                    <CopyableCodeBlock
                        code={`comfy node install ${node.id}`}
                        onCopy={handleInstall}
                    />
                </div>

                {/* Live Versions List */}
                {versions && versions.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">
                            {t('Versions')}
                        </h2>
                        <div className="space-y-2">
                            {versions.slice(0, 5).map((version: any) => (
                                <div
                                    key={version.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div>
                                        <span className="font-medium">
                                            v{version.version}
                                        </span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            <FormatRelativeDate
                                                date={version.created_at}
                                            />
                                        </span>
                                        {/* Live download count per version */}
                                        <span className="text-sm text-gray-500 ml-2">
                                            {formatDownloadCount(
                                                version.downloads || 0
                                            )}{' '}
                                            {t('downloads')}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="xs"
                                            onClick={() =>
                                                handleOpenDrawer(version)
                                            }
                                            color="gray"
                                        >
                                            {t('Details')}
                                        </Button>
                                        <Button
                                            size="xs"
                                            onClick={() =>
                                                handleDownload(version)
                                            }
                                            color="blue"
                                        >
                                            {t('Download')}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {node.repository && (
                        <div>
                            <Label>{t('Repository')}</Label>
                            <a
                                href={node.repository}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center"
                            >
                                {node.repository}
                                <MdOpenInNew className="ml-1" />
                            </a>
                        </div>
                    )}
                    {node.license && (
                        <div>
                            <Label>{t('License')}</Label>
                            <p className="text-gray-700">{node.license}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {isEditModalOpen && (
                <NodeEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModal(false)}
                    node={node}
                />
            )}
            {isDeleteModalOpen && (
                <NodeDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    node={node}
                />
            )}
            {selectedVersion && (
                <NodeVDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    version={selectedVersion}
                    nodeName={node.name}
                />
            )}
        </div>
    )
}

export default NodeDetailsWithDB
