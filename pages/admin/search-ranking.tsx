import withAdmin from '@/components/common/HOC/authAdmin'
import { CustomPagination } from '@/components/common/CustomPagination'
import { MdEdit } from 'react-icons/md'
import { Button, Spinner, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Node, useListAllNodes } from 'src/api/generated'
import SearchRankingEditModal from '@/components/nodes/SearchRankingEditModal'
import { formatDownloadCount } from '@/components/nodes/NodeDetails'

function SearchRankingAdminPage() {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterInput, setFilterInput] = useState('')
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    
    // Handle page from query parameters
    useEffect(() => {
        if (router.query.page) {
            setPage(parseInt(router.query.page as string))
        }
    }, [router.query.page])
    
    // Handle search term from query parameters
    useEffect(() => {
        if (router.query.search) {
            setSearchTerm(router.query.search as string)
            setFilterInput(router.query.search as string)
        }
    }, [router.query.search])
    
    // Fetch all nodes with pagination
    const { data, isLoading, isError } = useListAllNodes({
        page,
        pageSize: 20,
        search: searchTerm || undefined
    })
    
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
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(
            {
                pathname: router.pathname,
                query: { 
                    ...router.query, 
                    search: filterInput,
                    page: 1 // Reset to first page on new search
                },
            },
            undefined,
            { shallow: true }
        )
        setSearchTerm(filterInput)
    }
    
    const handleEditRanking = (node: Node) => {
        setSelectedNode(node)
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="" />
            </div>
        )
    }
    
    if (isError) {
        return (
            <div className="p-4">
                <h1 className="text-2xl font-bold text-gray-200 mb-6">Search Ranking Management</h1>
                <div className="text-red-500">Error loading nodes. Please try again later.</div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-200 mb-6">Search Ranking Management</h1>
            
            {/* Search form */}
            <form 
                className="flex gap-2 items-center mb-6" 
                onSubmit={handleSearch}
            >
                <TextInput
                    id="search-nodes"
                    placeholder="Search nodes by name or ID"
                    value={filterInput}
                    onChange={(e) => setFilterInput(e.target.value)}
                    className="flex-grow"
                />
                <Button color="blue" type="submit">Search</Button>
            </form>
            
            {/* Nodes table */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Nodes List</h2>
                <div className="text-sm text-gray-400 mb-2">
                    Total: {data?.total || 0} nodes
                </div>
                
                <ul className="divide-y divide-gray-700">
                    {/* Table header */}
                    <li className="grid grid-cols-5 gap-4 py-3 px-2 font-semibold text-gray-300">
                        <div>Node ID</div>
                        <div>Publisher ID</div>
                        <div>Downloads</div>
                        <div>Search Ranking</div>
                        <div>Operations</div>
                    </li>
                    
                    {/* Table rows */}
                    {data?.nodes?.map((node) => (
                        <li key={node.id} className="grid grid-cols-5 gap-4 py-3 px-2 hover:bg-gray-700">
                            <div className="truncate">
                                <Link href={`/nodes/${node.id}`} className="text-blue-400 hover:underline">
                                    {node.id}
                                </Link>
                            </div>
                            <div className="truncate text-gray-300">
                                {node.publisher?.id || 'N/A'}
                            </div>
                            <div className="text-gray-300">
                                {formatDownloadCount(node.downloads || 0)}
                            </div>
                            <div className="text-gray-300">
                                {node.search_ranking !== undefined ? node.search_ranking : 'N/A'}
                            </div>
                            <div>
                                <Button 
                                    size="xs" 
                                    color="blue"
                                    onClick={() => handleEditRanking(node)}
                                >
                                    <MdEdit className="mr-1" /> Edit
                                </Button>
                            </div>
                        </li>
                    ))}
                    
                    {/* Empty state */}
                    {(!data?.nodes || data.nodes.length === 0) && (
                        <li className="py-4 text-center text-gray-400">
                            No nodes found
                        </li>
                    )}
                </ul>
                
                {/* Pagination */}
                <div className="mt-4">
                    <CustomPagination
                        currentPage={page}
                        totalPages={data?.totalPages || 1}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
            
            {/* Edit Modal */}
            {selectedNode && (
                <SearchRankingEditModal
                    nodeId={selectedNode.id || ''}
                    defaultSearchRanking={selectedNode.search_ranking ?? 5}
                    open={!!selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    )
}

export default withAdmin(SearchRankingAdminPage)
