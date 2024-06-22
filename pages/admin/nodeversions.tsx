import React from 'react'
import { toast } from 'react-toastify'

import { Badge, Button, Spinner } from 'flowbite-react'
import { NodeVersionStatus, useListAllNodeVersions } from 'src/api/generated'
import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'

function NodeVersionList({}) {
    const [page, setPage] = React.useState<number>(1)
    const getAllNodeVersionsQuery = useListAllNodeVersions({
        page: page,
        pageSize: 16,
        statuses: [NodeVersionStatus.NodeVersionStatusFlagged],
    })
    const versions = getAllNodeVersionsQuery.data?.versions || []

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

    const onApprove = (id: string) => {
        // Implement approve logic
    }

    const onReject = (id: string) => {
        // Implement reject logic
    }

    return (
        <div>
            {versions.map((nodeVersion, index) => (
                <div
                    key={index}
                    className="border border-gray-600 p-4 rounded-md mb-4 flex flex-col justify-start gap-2"
                >
                    <p className="text-[24px] pt-2 text-gray-300">
                        {getNodeString(nodeVersion.downloadUrl)}
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
                    <p className="text-[18px] pt-2 text-gray-300">
                        Status Reason: {nodeVersion.status_reason}
                    </p>

                    <div className="flex">
                        <Button
                            color="blue"
                            className="flex"
                            onClick={() => onApprove(nodeVersion.id || '')}
                            style={{ marginRight: '5px' }}
                        >
                            Approve
                        </Button>
                        <Button
                            color="failure"
                            onClick={() => onReject(nodeVersion.id || '')}
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
                    onPageChange={(page: number) => setPage(page)}
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
