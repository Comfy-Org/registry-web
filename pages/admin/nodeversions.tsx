import { useRouter } from 'next/router'
import React from 'react'
import { toast } from 'react-toastify'

import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { NodeStatusReason } from '@/components/NodeStatusReason'
import { useQueryClient } from '@tanstack/react-query'
import { Badge, Button, Spinner } from 'flowbite-react'
import { omit } from 'rambda'
import {
    NodeVersionStatus,
    useAdminUpdateNodeVersion,
    useListAllNodeVersions,
} from 'src/api/generated'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'

function NodeVersionList({}) {
    const router = useRouter()
    const [page, setPage] = React.useState<number>(1)
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

    const onApprove = (id: string, versionNumber: string) => {
        updateNodeVersionMutation.mutate(
            {
                nodeId: id,
                versionNumber: versionNumber,
                data: {
                    status: NodeVersionStatus.NodeVersionStatusActive,
                    status_reason: 'Approved by admin',
                },
            },
            {
                onSuccess: () => {
                    toast.success('Node version approved')
                    queryClient.invalidateQueries({
                        queryKey: ['/versions'],
                    })
                },
                onError: () => {
                    toast.error('Error approving node version')
                },
            }
        )
    }

    const onReject = (id: string, versionNumber: string) => {
        updateNodeVersionMutation.mutate(
            {
                nodeId: id,
                versionNumber: versionNumber,
                data: {
                    status: NodeVersionStatus.NodeVersionStatusBanned,
                    status_reason: 'Rejected by admin',
                },
            },
            {
                onSuccess: () => {
                    toast.success('Node version rejected')
                    queryClient.invalidateQueries({
                        queryKey: ['/versions'],
                    })
                    queryClient.refetchQueries({
                        queryKey: ['/versions'],
                    })
                },
                onError: () => {
                    toast.error('Error rejecting node version')
                },
            }
        )
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
                            onClick={() =>
                                onApprove(
                                    nodeVersion.node_id as string,
                                    nodeVersion.version as string
                                )
                            }
                            style={{ marginRight: '5px' }}
                        >
                            Approve
                        </Button>
                        <Button
                            color="failure"
                            onClick={() =>
                                onReject(
                                    nodeVersion.node_id as string,
                                    nodeVersion.version as string
                                )
                            }
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
