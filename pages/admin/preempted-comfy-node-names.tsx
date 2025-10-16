import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { formatDownloadCount } from '@/components/nodes/NodeDetails'
import {
    UnifiedBreadcrumb,
    createHomeBreadcrumb,
    createAdminDashboardBreadcrumb,
} from '@/components/common/UnifiedBreadcrumb'
import PreemptedComfyNodeNamesEditModal from '@/components/nodes/PreemptedComfyNodeNamesEditModal'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Button, Spinner, TextInput } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { MdEdit } from 'react-icons/md'
import { Node, useSearchNodes } from '@/src/api/generated'
import { useRouterQuery } from 'src/hooks/useRouterQuery'

function PreemptedComfyNodeNamesAdminPage() {
    const { t } = useNextTranslation()
    const router = useRouter()
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)

    // Use the custom hook for query parameters
    const [query, updateQuery] = useRouterQuery()

    // Extract and parse query parameters directly
    const page = Number(query.page || 1)
    const searchQuery = String(query.search || '')

    // Create breadcrumb items
    const breadcrumbItems = [
        createHomeBreadcrumb(t),
        createAdminDashboardBreadcrumb(t),
        { href: '', label: t('Preempted ComfyUI Node Names') },
    ]

    // Fetch all nodes with pagination - searchQuery being undefined is handled properly
    const { data, isLoading, isError } = useSearchNodes({
        page,
        limit: 24,
        search: searchQuery || undefined,
    })

    // Handle page change - just update router
    const handlePageChange = (newPage: number) => {
        updateQuery({ page: String(newPage) })
    }

    // Handle search form submission
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const searchInput =
            (form.elements.namedItem('search-nodes') as HTMLInputElement)
                ?.value || ''

        updateQuery({
            search: searchInput,
            page: String(1), // Reset to first page on new search
        })
    }

    const handleEditPreemptedComfyNodeNames = (node: Node) => {
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
                <h1 className="text-2xl font-bold text-gray-200 mb-6">
                    {t('Preempted Comfy Node Names Management')}
                </h1>
                <div className="text-red-500">
                    {t('Error loading nodes. Please try again later.')}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="py-4">
                <UnifiedBreadcrumb items={breadcrumbItems} />
            </div>

            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                {t('Preempted ComfyUI Node Names')}
            </h1>
            {/* Search form */}
            <form
                className="flex gap-2 items-center mb-6"
                onSubmit={handleSearch}
            >
                <TextInput
                    id="search-nodes"
                    name="search-nodes"
                    placeholder={t('Search nodes by name or ID')}
                    defaultValue={searchQuery}
                    className="flex-grow"
                />
                <Button color="blue" type="submit">
                    {t('Search')}
                </Button>
            </form>
            {/* Nodes table */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                    {t('Nodes List')}
                </h2>
                <div className="text-sm text-gray-400 mb-2">
                    {t('Total')}: {data?.total || 0} {t('nodes')}
                </div>

                <ul className="divide-y divide-gray-700">
                    {/* Table header */}
                    <li className="grid grid-cols-5 gap-4 py-3 px-2 font-semibold text-gray-300">
                        <div>{t('Node ID')}</div>
                        <div>{t('Publisher ID')}</div>
                        <div>{t('Downloads')}</div>
                        <div>{t('Preempted Comfy Node Names')}</div>
                        <div>{t('Operations')}</div>
                    </li>

                    {/* Table rows */}
                    {data?.nodes?.map((node) => (
                        <li
                            key={node.id}
                            className="grid grid-cols-5 gap-4 py-3 px-2 hover:bg-gray-700"
                        >
                            <div className="truncate">
                                <Link
                                    href={`/nodes/${node.id}`}
                                    className="text-blue-400 hover:underline"
                                >
                                    {node.id}
                                </Link>
                            </div>
                            <div className="truncate text-gray-300">
                                {node.publisher?.id || t('N/A')}
                            </div>
                            <div className="text-gray-300">
                                {formatDownloadCount(node.downloads || 0)}
                            </div>
                            <div className="text-gray-300">
                                {node.preempted_comfy_node_names &&
                                node.preempted_comfy_node_names.length > 0
                                    ? node.preempted_comfy_node_names
                                          .slice(0, 3)
                                          .join(', ') +
                                      (node.preempted_comfy_node_names.length >
                                      3
                                          ? '...'
                                          : '')
                                    : t('N/A')}
                            </div>
                            <div>
                                <Button
                                    size="xs"
                                    color="blue"
                                    onClick={() =>
                                        handleEditPreemptedComfyNodeNames(node)
                                    }
                                >
                                    <MdEdit className="mr-1" /> {t('Edit')}
                                </Button>
                            </div>
                        </li>
                    ))}

                    {/* Empty state */}
                    {(!data?.nodes || data.nodes.length === 0) && (
                        <li className="py-4 text-center text-gray-400">
                            {t('No nodes found')}
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
                <PreemptedComfyNodeNamesEditModal
                    nodeId={selectedNode.id || ''}
                    defaultPreemptedComfyNodeNames={
                        selectedNode.preempted_comfy_node_names || []
                    }
                    open={!!selectedNode}
                    onClose={() => setSelectedNode(null)}
                />
            )}
        </div>
    )
}

export default withAdmin(PreemptedComfyNodeNamesAdminPage)
