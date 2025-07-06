import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import UnclaimedNodeCard from '@/components/nodes/UnclaimedNodeCard'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { Breadcrumb, Button, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome, HiPlus } from 'react-icons/hi'
import {
    getListNodesForPublisherQueryKey,
    useListNodesForPublisherV2,
} from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'

export default withAdmin(ClaimNodesPage)
function ClaimNodesPage() {
    const { t } = useNextTranslation()
    const router = useRouter()
    const queryClient = useQueryClient()
    const pageSize = 36
    // Get page from URL query params, defaulting to 1
    const currentPage = router.query.page
        ? parseInt(router.query.page as string, 10)
        : 1

    const handlePageChange = (page: number) => {
        // Update URL with new page parameter
        router.push(
            { pathname: router.pathname, query: { ...router.query, page } },
            undefined,
            { shallow: true }
        )
    }

    // Use the page from router.query for the API call
    const { data, isError, isLoading } = useListNodesForPublisherV2(
        UNCLAIMED_ADMIN_PUBLISHER_ID,
        { page: currentPage, limit: pageSize }
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="p-4 text-white">
                <h1 className="text-2xl font-bold text-gray-200 mb-6">
                    {t('Error Loading Unclaimed Nodes')}
                </h1>
                <p className="text-red-400">
                    {t(
                        'There was an error loading the nodes. Please try again later.'
                    )}
                </p>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="mb-6">
                <Breadcrumb className="py-4">
                    <Breadcrumb.Item
                        href="/"
                        icon={HiHome}
                        onClick={(e) => {
                            e.preventDefault()
                            router.push('/')
                        }}
                        className="dark"
                    >
                        {t('Home')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item
                        href="/admin"
                        onClick={(e) => {
                            e.preventDefault()
                            router.push('/admin')
                        }}
                        className="dark"
                    >
                        {t('Admin Dashboard')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="dark">
                        Unclaimed Nodes
                    </Breadcrumb.Item>
                </Breadcrumb>

                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-200">
                        {t('Unclaimed Nodes')}
                    </h1>
                    <div>
                        <Button
                            color="blue"
                            onClick={() =>
                                router.push('/admin/add-unclaimed-node')
                            }
                            className="mr-2"
                        >
                            <HiPlus className="mr-2 h-5 w-5" />
                            {t('Add New Unclaimed Node')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="text-gray-200 mb-4">
                {t(
                    'These nodes are not claimed by any publisher. They can be claimed by publishers or edited by administrators.'
                )}
            </div>

            {data?.nodes?.length === 0 ? (
                <div className="bg-gray-800 p-4 rounded text-gray-200">
                    {t('No unclaimed nodes found.')}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {data?.nodes?.map((node) => (
                            <UnclaimedNodeCard
                                key={node.id}
                                node={node}
                                onSuccess={() => {
                                    // Revalidate the node list undef admin-publisher-id when a node is successfully claimed
                                    queryClient.invalidateQueries({
                                        queryKey:
                                            getListNodesForPublisherQueryKey(
                                                UNCLAIMED_ADMIN_PUBLISHER_ID
                                            ).slice(0, 1),
                                    })
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-4">
                        <CustomPagination
                            onPageChange={handlePageChange}
                            currentPage={currentPage}
                            totalPages={Math.ceil(
                                (data?.total || 0) / pageSize
                            )}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
