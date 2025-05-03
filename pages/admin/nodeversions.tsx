import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { NodeStatusReason, zStatusReason } from '@/components/NodeStatusReason'
import { parseJsonSafe } from '@/components/parseJsonSafe'
import { useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { omit } from 'rambda'
import React, { useState } from 'react'
import { HiPlusCircle } from 'react-icons/hi'
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
    const { data: user } = useGetUser()

    React.useEffect(() => {
        if (router.query.page) {
            setPage(parseInt(router.query.page as string))
        }
    }, [router.query.page])

    // allows filter by search param like /admin/nodeversions?filter=flagged&filter=pending
    const flags = {
        flagged: NodeVersionStatus.NodeVersionStatusFlagged,
        pending: NodeVersionStatus.NodeVersionStatusPending,
        deleted: NodeVersionStatus.NodeVersionStatusDeleted,
    } // satisfies Record<string, NodeVersionStatus> // 'satisfies' requires latest typescript
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
    const onApprove = async (nv: NodeVersion) => {
        const message = prompt('Approve Reason: ', 'Approved by admin')
        if (!message) return toast.error('Please provide a reason')

        await onReview({
            nodeVersion: nv,
            status: NodeVersionStatus.NodeVersionStatusActive,
            message,
        })
        toast.success(`${nv.node_id!}@${nv.version!} Approved`)
    }
    const onReject = async (nv: NodeVersion) => {
        const message = prompt('Reject Reason: ', 'Rejected by admin')
        if (!message) return toast.error('Please provide a reason')

        await onReview({
            nodeVersion: nv,
            status: NodeVersionStatus.NodeVersionStatusDeleted,
            message,
        })
        toast.success(`${nv.node_id!}@${nv.version!} Rejected`)
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

    return (
        <div>
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
                            selectedStatus.includes(
                                NodeVersionStatus.NodeVersionStatusFlagged
                            )
                                ? 'warning'
                                : 'gray'
                        }
                        onClick={() =>
                            setSelectedStatus([
                                NodeVersionStatus.NodeVersionStatusFlagged,
                            ])
                        }
                    >
                        Flagged Nodes
                    </Button>
                    <Button
                        color={
                            selectedStatus.includes(
                                NodeVersionStatus.NodeVersionStatusPending
                            )
                                ? 'info'
                                : 'gray'
                        }
                        onClick={() =>
                            setSelectedStatus([
                                NodeVersionStatus.NodeVersionStatusPending,
                            ])
                        }
                    >
                        Pending Nodes
                    </Button>
                    <Button
                        color={
                            selectedStatus.includes(
                                NodeVersionStatus.NodeVersionStatusDeleted
                            )
                                ? 'failure'
                                : 'gray'
                        }
                        onClick={() =>
                            setSelectedStatus([
                                NodeVersionStatus.NodeVersionStatusDeleted,
                            ])
                        }
                    >
                        Deleted Nodes
                    </Button>
                    <Button
                        color={selectedStatus.length > 2 ? 'success' : 'gray'}
                        onClick={() =>
                            setSelectedStatus([
                                NodeVersionStatus.NodeVersionStatusFlagged,
                                NodeVersionStatus.NodeVersionStatusPending,
                                NodeVersionStatus.NodeVersionStatusDeleted,
                            ])
                        }
                    >
                        All
                    </Button>
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

            {versions.map((nodeVersion, index) => (
                <div
                    key={index}
                    className="border border-gray-600 p-4 rounded-md mb-4 flex flex-col justify-start gap-2"
                >
                    <p className="text-[24px] pt-2 text-gray-300">
                        <a href={`/nodes/${nodeVersion.node_id}`}>
                            {nodeVersion.node_id}
                        </a>
                    </p>
                    <p className="text-[18px] pt-2 text-gray-300">
                        Version: {nodeVersion.version}
                    </p>
                    <div className="flex flex-row items-center gap-2">
                        <p className="text-[18px] text-gray-300">Status: </p>
                        <Badge color="warning">
                            {NodeVersionStatusToReadable(nodeVersion.status)}
                        </Badge>
                    </div>
                    <NodeStatusReason {...nodeVersion} />

                    <div className="flex">
                        <Button
                            color="blue"
                            className="flex"
                            onClick={() => onApprove(nodeVersion)}
                            style={{ marginRight: '5px' }}
                        >
                            Approve
                        </Button>
                        <Button
                            color="failure"
                            onClick={() => onReject(nodeVersion)}
                        >
                            Reject
                        </Button>
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
