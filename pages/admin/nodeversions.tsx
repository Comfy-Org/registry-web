import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { NodeStatusReason, zStatusReason } from '@/components/NodeStatusReason'
import { parseJsonSafe } from '@/components/parseJsonSafe'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import {
    Badge,
    Button,
    Checkbox,
    Label,
    Modal,
    Spinner,
    TextInput,
} from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import pMap from 'p-map'
import { omit } from 'rambda'
import React, { useRef, useState } from 'react'
import { FaGithub, FaLink } from 'react-icons/fa'
import { HiBan, HiCheck, HiPlusCircle, HiReply } from 'react-icons/hi'
import { toast } from 'react-toastify'
import {
    NodeVersion,
    NodeVersionStatus,
    useAdminUpdateNodeVersion,
    useGetUser,
    useListAllNodeVersions,
} from 'src/api/generated'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'

function NodeVersionList({}) {
    const router = useRouter()
    const [page, setPage] = React.useState<number>(1)
    const [selectedVersions, setSelectedVersions] = useState<{
        [key: string]: boolean
    }>({})
    const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false)
    const [batchAction, setBatchAction] = useState<string>('')
    const [batchReason, setBatchReason] = useState<string>('')
    const { data: user } = useGetUser()
    const lastCheckedRef = useRef<string | null>(null)

    React.useEffect(() => {
        if (router.query.page) {
            setPage(parseInt(router.query.page as string))
        }
    }, [router.query.page])

    // allows filter by search param like /admin/nodeversions?filter=flagged&filter=pending
    const flags = {
        flagged: NodeVersionStatus.NodeVersionStatusFlagged,
        banned: NodeVersionStatus.NodeVersionStatusBanned,
        deleted: NodeVersionStatus.NodeVersionStatusDeleted,
        pending: NodeVersionStatus.NodeVersionStatusPending,
        active: NodeVersionStatus.NodeVersionStatusActive,
    } // satisfies Record<string, NodeVersionStatus> // 'satisfies' requires latest typescript
    const flagColors = {
        all: 'success',
        flagged: 'warning',
        pending: 'info',
        deleted: 'failure',
        banned: 'failure',
        active: 'info',
    }
    const allFlags = [...Object.values(flags)].sort()

    const defaultSelectedStatus = [
        (router.query as any)?.filter ?? Object.keys(flags),
    ]
        .flat()
        .map((flag) => flags[flag])

    const [selectedStatus, _setSelectedStatus] = React.useState<
        NodeVersionStatus[]
    >(defaultSelectedStatus)

    const setSelectedStatus = (status: NodeVersionStatus[]) => {
        _setSelectedStatus(status)

        const checkedAll =
            allFlags.join(',').toString() ===
            [...status].sort().join(',').toString()
        const searchParams = checkedAll
            ? undefined
            : ({
                  filter: Object.entries(flags)
                      .filter(([flag, s]) => status.includes(s))
                      .map(([flag]) => flag),
              } as any)
        const search = new URLSearchParams({
            ...(omit('filter')(router.query) as object),
            ...searchParams,
        })
            .toString()
            .replace(/^(?!$)/, '?')
        router.push(router.pathname + search + location.hash)
    }

    const [isAdminCreateNodeModalOpen, setIsAdminCreateNodeModalOpen] =
        useState(false)

    const getAllNodeVersionsQuery = useListAllNodeVersions({
        page: page,
        pageSize: 8,
        statuses: selectedStatus,
        include_status_reason: true,
    })
    const versions = getAllNodeVersionsQuery.data?.versions || []

    const updateNodeVersionMutation = useAdminUpdateNodeVersion()
    const queryClient = useQueryClient()

    React.useEffect(() => {
        if (getAllNodeVersionsQuery.isError) {
            toast.error('Error getting node versions')
        }
    }, [getAllNodeVersionsQuery])

    if (getAllNodeVersionsQuery.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        )
    }

    async function onReview({
        nodeVersion: nv,
        status,
        message,
    }: {
        nodeVersion: NodeVersion
        status: NodeVersionStatus
        message: string
    }) {
        // parse previous status reason with fallbacks
        const prevStatusReasonJson = parseJsonSafe(nv.status_reason).data
        const prevStatusReason =
            zStatusReason.safeParse(prevStatusReasonJson).data
        const previousHistory = prevStatusReason?.statusHistory ?? []
        const previousStatus = nv.status ?? 'Unknown Status' // should not happen
        const previousMessage =
            prevStatusReason?.message ?? nv.status_reason ?? '' // use raw msg if fail to parse json
        const previousBy = prevStatusReason?.by ?? 'admin@comfy.org' // unknown admin

        // concat history
        const statusHistory = [
            ...previousHistory,
            {
                status: previousStatus,
                message: previousMessage,
                by: previousBy,
            },
        ]
        console.log('History', statusHistory)

        // updated status reason, with history
        const reason = zStatusReason.parse({
            message,
            by: user?.email ?? 'admin@comfy.org', // if user is not loaded, use 'Admin'
            statusHistory,
        })
        await updateNodeVersionMutation.mutateAsync(
            {
                nodeId: nv.node_id!.toString(),
                versionNumber: nv.version!.toString(),
                data: { status, status_reason: JSON.stringify(reason) },
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ['/versions'],
                    })
                },
                onError: (error) => {
                    console.error('Error reviewing node version', error)
                    toast.error(
                        `Error reviewing node version ${nv.node_id!}@${nv.version!}`
                    )
                },
            }
        )
    }
    const onApprove = async (nv: NodeVersion, message?: string | null) => {
        message ||= prompt('Approve Reason: ', 'Approved by admin')
        if (!message) return toast.error('Please provide a reason')

        await onReview({
            nodeVersion: nv,
            status: NodeVersionStatus.NodeVersionStatusActive,
            message,
        })
        toast.success(`${nv.node_id!}@${nv.version!} Approved`)
    }
    const onReject = async (nv: NodeVersion, message?: string | null) => {
        message ||= prompt('Reject Reason: ', 'Rejected by admin')
        if (!message) return toast.error('Please provide a reason')

        await onReview({
            nodeVersion: nv,
            status: NodeVersionStatus.NodeVersionStatusBanned,
            message,
        })
        toast.success(`${nv.node_id!}@${nv.version!} Rejected`)
    }
    const checkIsUndoable = (nv: NodeVersion) =>
        !!zStatusReason.safeParse(parseJsonSafe(nv.status_reason).data).data
            ?.statusHistory?.length

    const onUndo = async (nv: NodeVersion) => {
        const statusHistory = zStatusReason.safeParse(
            parseJsonSafe(nv.status_reason).data
        ).data?.statusHistory
        if (!statusHistory?.length)
            return toast.error('No status history found')

        const prevStatus = statusHistory[statusHistory.length - 1].status
        const by = user?.email // the user who clicked undo
        if (!by) {
            toast.error('Unable to get user email, please reload and try again')
            return
        }

        const statusReason = zStatusReason.parse({
            message: statusHistory[statusHistory.length - 1].message,
            by,
            statusHistory: statusHistory.slice(0, -1),
        })
        await updateNodeVersionMutation.mutateAsync(
            {
                nodeId: nv.node_id!.toString(),
                versionNumber: nv.version!.toString(),
                data: {
                    status: prevStatus,
                    status_reason: JSON.stringify(statusReason),
                },
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['/versions'] })
                    toast.success(
                        `${nv.node_id!}@${nv.version!} Undone, back to ${NodeVersionStatusToReadable(prevStatus)}`
                    )
                },
                onError: (error) => {
                    console.error('Error undoing node version', error)
                    toast.error(
                        `Error undoing node version ${nv.node_id!}@${nv.version!}`
                    )
                },
            }
        )
    }

    const handleBatchOperation = () => {
        const selectedKeys = Object.keys(selectedVersions).filter(
            (key) => selectedVersions[key]
        )
        if (selectedKeys.length === 0) {
            toast.error('No versions selected')
            return
        }

        // setBatchAction('')
        setIsBatchModalOpen(true)
    }

    const defaultBatchReasons = {
        approve: 'Batch approved by admin',
        reject: 'Batch rejected by admin',
        undo: 'Batch undone by admin',
    }
    const executeBatchOperation = async () => {
        // Process batch operations for the selected versions
        const selectedKeys = Object.keys(selectedVersions).filter(
            (key) => selectedVersions[key]
        )

        if (selectedKeys.length === 0) {
            toast.error('No versions selected')
            return
        }
        const reason =
            batchReason ||
            (batchAction in defaultBatchReasons
                ? prompt('Reason', defaultBatchReasons[batchAction])
                : '')
        // Map batch actions to their corresponding handlers
        const batchActions = {
            approve: (nv: NodeVersion) => onApprove(nv, reason),
            reject: (nv: NodeVersion) => onReject(nv, reason),
            undo: (nv: NodeVersion) => onUndo(nv),
        }

        // Process all selected items using the appropriate action handler
        await pMap(
            selectedKeys,
            async (key) => {
                const [nodeId, version] = key.split('@')
                const nodeVersion = versions.find(
                    (nv) => nv.node_id === nodeId && nv.version === version
                )
                if (!nodeVersion) {
                    toast.error(`Node version ${key} not found`)
                    return
                }
                const actionHandler = batchActions[batchAction]
                if (!actionHandler) {
                    toast.error(`Invalid batch action: ${batchAction}`)
                    return
                }
                if (actionHandler) {
                    await actionHandler(nodeVersion)
                }
            },
            { concurrency: 5, stopOnError: false }
        )

        setSelectedVersions({})
        setIsBatchModalOpen(false)
        setBatchReason('')
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
        router.push(
            {
                pathname: router.pathname,
                query: { ...router.query, page: newPage },
            },
            undefined,
            { shallow: true }
        )
    }

    const BatchOperationHeader = () => {
        if (!Object.keys(selectedVersions).some((key) => selectedVersions[key]))
            return null
        return (
            <div className="fixed top-0 left-0 right-0 bg-gray-800 p-4 z-50 flex justify-between items-center shadow-lg">
                <div className="flex items-center flex-wrap gap-4">
                    <span className="text-white font-medium mr-4">
                        {
                            Object.keys(selectedVersions).filter(
                                (key) => selectedVersions[key]
                            ).length
                        }{' '}
                        versions selected
                    </span>

                    <Button
                        color="success"
                        onClick={() => {
                            setBatchAction('approve')
                            handleBatchOperation()
                        }}
                        className="mr-2"
                    >
                        <HiCheck className="mr-2" /> Batch Approve
                    </Button>
                    <Button
                        color="failure"
                        onClick={() => {
                            setBatchAction('reject')
                            handleBatchOperation()
                        }}
                        className="mr-2"
                    >
                        <HiBan className="mr-2" /> Batch Reject
                    </Button>
                    <Button
                        color="warning"
                        onClick={() => {
                            setBatchAction('undo')
                            handleBatchOperation()
                        }}
                    >
                        <HiReply className="mr-2" /> Batch Undo
                    </Button>
                </div>
                <Button color="gray" onClick={() => setSelectedVersions({})}>
                    Clear Selection
                </Button>
            </div>
        )
    }
    return (
        <div>
            <BatchOperationHeader />

            {/* Batch operation modal */}
            <Modal
                show={isBatchModalOpen}
                onClose={() => setIsBatchModalOpen(false)}
            >
                <Modal.Header>
                    {`Batch ${
                        {
                            approve: 'Approve',
                            reject: 'Reject',
                            undo: 'Undo',
                        }[batchAction]
                    } Node Versions`}
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            You are about to{' '}
                            {
                                {
                                    approve: 'approve',
                                    reject: 'reject',
                                    undo: 'undo',
                                }[batchAction]
                            }{' '}
                            {
                                Object.keys(selectedVersions).filter(
                                    (key) => selectedVersions[key]
                                ).length
                            }{' '}
                            node versions.
                        </p>
                        <div>
                            <Label
                                htmlFor="reason"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                                Reason (optional)
                            </Label>
                            <TextInput
                                id="reason"
                                placeholder={defaultBatchReasons[batchAction] ?? ''}
                                value={batchReason}
                                onChange={(e) => setBatchReason(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={executeBatchOperation}>Confirm</Button>
                    <Button
                        color="gray"
                        onClick={() => setIsBatchModalOpen(false)}
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className="flex flex-col gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-200">
                    Node Versions
                </h1>
                <h1 className="text-lg font-bold text-gray-200">
                    Total Results : {getAllNodeVersionsQuery.data?.total}
                </h1>
                <div className="flex gap-2">
                    <Button
                        color={
                            selectedStatus.length > Object.keys(flags).length
                                ? flagColors.all
                                : 'gray'
                        }
                        className={clsx({
                            // use tailwind add a filter set bright 50% if not selected
                            'brightness-50': !(
                                selectedStatus.length >=
                                Object.keys(flags).length
                            ),
                            'hover:brightness-100': !(
                                selectedStatus.length >=
                                Object.keys(flags).length
                            ),
                            'transition-all duration-200': true,
                        })}
                        onClick={() =>
                            setSelectedStatus(Object.values(NodeVersionStatus))
                        }
                    >
                        All
                    </Button>

                    {Object.entries(flags).map(([flag, status]) => (
                        <Button
                            key={flag}
                            color={flagColors[flag]}
                            className={clsx({
                                // use tailwind add a filter set bright 50% if not selected
                                'brightness-50':
                                    !selectedStatus.includes(status),
                                'hover:brightness-100':
                                    !selectedStatus.includes(status),
                                'transition-all duration-200': true,
                            })}
                            aria-checked={selectedStatus.includes(status)}
                            onClick={() =>
                                setSelectedStatus([status as NodeVersionStatus])
                            }
                        >
                            {flag.charAt(0).toUpperCase() + flag.slice(1)} Nodes
                        </Button>
                    ))}
                    {' | '}

                    <Button
                        onClick={() => {
                            setIsAdminCreateNodeModalOpen(true)
                        }}
                    >
                        <HiPlusCircle />
                        Add Unclaimed Node
                    </Button>

                    <AdminCreateNodeFormModal
                        open={isAdminCreateNodeModalOpen}
                        onClose={() => setIsAdminCreateNodeModalOpen(false)}
                    />
                </div>
            </div>

            {versions
                .map((nv) => ({ ...nv, key: `${nv.node_id}@${nv.version}` }))
                .map(({ key, ...nv }, index) => (
                    <div
                        key={index}
                        className="border border-gray-600 p-4 rounded-md mb-4 flex flex-col justify-start gap-2"
                    >
                        <div className="flex-1 text-[24px] text-gray-300 flex-2 flex items-center gap-4 pt-2">
                            <Checkbox
                                checked={Boolean(selectedVersions[key])}
                                onChange={(e) => {
                                    // hold shift to select multiple
                                    if (
                                        e.nativeEvent instanceof MouseEvent &&
                                        e.nativeEvent.shiftKey &&
                                        lastCheckedRef.current
                                    ) {
                                        const allKeys = versions.map(
                                            (nv) =>
                                                `${nv.node_id}@${nv.version}`
                                        )
                                        const [currentIndex, lastIndex] = [
                                            allKeys.indexOf(key),
                                            allKeys.indexOf(
                                                lastCheckedRef.current
                                            ),
                                        ]
                                        if (
                                            currentIndex >= 0 &&
                                            lastIndex >= 0
                                        ) {
                                            const [start, end] = [
                                                Math.min(
                                                    currentIndex,
                                                    lastIndex
                                                ),
                                                Math.max(
                                                    currentIndex,
                                                    lastIndex
                                                ),
                                            ]
                                            const newState =
                                                !selectedVersions[key]
                                            setSelectedVersions((prev) => {
                                                const updated = { ...prev }
                                                for (
                                                    let i = start;
                                                    i <= end;
                                                    i++
                                                )
                                                    updated[allKeys[i]] =
                                                        newState
                                                return updated
                                            })
                                        }
                                    } else {
                                        setSelectedVersions((prev) => ({
                                            ...prev,
                                            [key]: !prev[key],
                                        }))
                                    }

                                    // Update the last checked reference
                                    lastCheckedRef.current = key
                                }}
                                id={`checkbox-${nv.node_id}@${nv.version}`}
                                onKeyDown={(e) => {
                                    // allow arrow keys to navigate
                                    const dir = {
                                        ArrowUp: -1,
                                        ArrowDown: 1,
                                    }[e.key]

                                    if (!dir) return

                                    e.preventDefault()
                                    const nextIndex =
                                        (index + dir) % versions.length
                                    const nextNodeVersion = versions[nextIndex]
                                    const nextSelector = `#checkbox-${nextNodeVersion.node_id}@${nextNodeVersion.version}`
                                    const nextElement = document.querySelector(
                                        nextSelector
                                    ) as HTMLInputElement
                                    if (!nextElement) return

                                    nextElement.focus()
                                    nextElement.scrollIntoView({
                                        behavior: 'smooth',
                                        block: 'start',
                                    })
                                }}
                            />
                            <Label
                                htmlFor={`checkbox-${nv.node_id}@${nv.version}`}
                                className="text-[24px] text-gray-300"
                            >
                                {nv.node_id}
                            </Label>
                            <Link target="_blank" href={`/nodes/${nv.node_id}`}>
                                <FaLink className="w-6 h-6" />
                            </Link>
                            <Link target="_blank" href={`/nodes/${nv.node_id}`}>
                                <FaGithub className="w-6 h-6" title="Github" />
                            </Link>
                        </div>
                        <p className="text-[18px] pt-2 text-gray-300">
                            Version: {nv.version}
                        </p>
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-[18px] text-gray-300">
                                Status:{' '}
                            </p>
                            <Badge color="warning">
                                {NodeVersionStatusToReadable(nv.status)}
                            </Badge>
                        </div>
                        <NodeStatusReason {...nv} />

                        <div className="flex gap-2">
                            <Button
                                color="blue"
                                className="flex"
                                onClick={() => onApprove(nv)}
                            >
                                Approve
                            </Button>
                            <Button
                                color="failure"
                                onClick={() => onReject(nv)}
                            >
                                Reject
                            </Button>

                            {checkIsUndoable(nv) && (
                                <Button color="gray" onClick={() => onUndo(nv)}>
                                    Undo
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            <div className="">
                <CustomPagination
                    currentPage={page}
                    totalPages={getAllNodeVersionsQuery.data?.totalPages || 1}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    )
}

const getNodeString = (url?: string): string => {
    if (!url) return ''
    const match = url.match(/comfy-registry\/(.+?)\/\d+\.\d+\.\d+\/node\.zip/)
    return match ? match[1] : ''
}

export default withAdmin(NodeVersionList)
