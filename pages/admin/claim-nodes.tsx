import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import NodesCard from '@/components/nodes/NodesCard'
import { Button, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { HiArrowLeft, HiPlus } from 'react-icons/hi'
import { useSearchNodes } from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'

export default withAdmin(ClaimNodesPage)
function ClaimNodesPage() {
    const router = useRouter()
    const [page, setPage] = useState<number>(1)
    const pageSize = 12
    
    const { data: nodesData, isLoading, error } = useSearchNodes(
        {
            page,
            limit: pageSize,
            include_banned: false
        },
        {
            query: {
                select: (data) => {
                    // Filter to only include unclaimed nodes
                    return {
                        ...data,
                        nodes: data.nodes?.filter(
                            (node) => node.publisher?.id === UNCLAIMED_ADMIN_PUBLISHER_ID
                        ) || [],
                        total: data.nodes?.filter(
                            (node) => node.publisher?.id === UNCLAIMED_ADMIN_PUBLISHER_ID
                        ).length || 0
                    }
                }       
            }
        }
    )

    const handlePageChange = (page: number) => {
        setPage(page)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 text-white">
                <h1 className="text-2xl font-bold text-gray-200 mb-6">
                    Error Loading Unclaimed Nodes
                </h1>
                <p className="text-red-400">There was an error loading the nodes. Please try again later.</p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-200">
                    Unclaimed Nodes
                </h1>
                <div>
                    <Button
                        color="blue"
                        onClick={() => router.push('/admin/add-unclaimed-node')}
                        className="mr-2"
                    >
                        <HiPlus className="mr-2 h-5 w-5" />
                        Add New Unclaimed Node
                    </Button>
                    <Button
                        color="gray"
                        onClick={() => router.push('/admin')}
                    >
                        <HiArrowLeft className="mr-2 h-5 w-5" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
            
            <div className="text-gray-200 mb-4">
                These nodes are not claimed by any publisher. They can be claimed by publishers or edited by administrators.
            </div>
            
            {nodesData?.nodes?.length === 0 ? (
                <div className="bg-gray-800 p-4 rounded text-gray-200">
                    No unclaimed nodes found.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {nodesData?.nodes?.map((node) => (
                            <NodesCard
                                key={node.id}
                                node={node}
                                buttonLink={`/nodes/${node.id}`}
                            />
                        ))}
                    </div>
                    
                    <div className="mt-4">
                        <CustomPagination
                            currentPage={page}
                            totalPages={Math.ceil((nodesData?.total || 0) / pageSize)}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    )
}

