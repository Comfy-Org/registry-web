import { Badge, Breadcrumb, Card, Table } from 'flowbite-react'
import React, { useState } from 'react'
import { HiHome, HiOutlineCollection, HiTag } from 'react-icons/hi'
import AdminTreeNavigation from '@/components/admin/AdminTreeNavigation'
import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { usePage } from '@/components/hooks/usePage'
import { useListAllNodes } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

export default withAdmin(CategoriesPage)
function CategoriesPage() {
    const { t } = useNextTranslation()
    const [page, setPage] = usePage()
    const [limit] = useState<number>(20)

    const { data: nodesData } = useListAllNodes({
        page: page || 1,
        limit: limit,
        sort: ['name'],
    })

    const totalPages = Math.ceil((nodesData?.total || 0) / limit)
    const nodes = nodesData?.nodes || []

    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="/" icon={HiHome} className="dark">
                    {t('Home')}
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/admin" className="dark">
                    {t('Admin Dashboard')}
                </Breadcrumb.Item>
                <Breadcrumb.Item href="#" className="dark">
                    {t('Tag Management')}
                </Breadcrumb.Item>
            </Breadcrumb>

            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                {t('Tag Management')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <AdminTreeNavigation />
                </div>

                <div className="lg:col-span-3">
                    <Card className="bg-gray-800 border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-200">
                                {t('Nodes with Tags')}
                            </h2>
                            <Badge color="info" icon={HiOutlineCollection}>
                                {nodesData?.total || 0} {t('nodes')}
                            </Badge>
                        </div>

                        {nodes.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <Table.Head>
                                        <Table.HeadCell className="bg-gray-700 text-gray-200">
                                            {t('Node Name')}
                                        </Table.HeadCell>
                                        <Table.HeadCell className="bg-gray-700 text-gray-200">
                                            {t('Tags')}
                                        </Table.HeadCell>
                                    </Table.Head>
                                    <Table.Body className="divide-y divide-gray-700">
                                        {nodes.map((node) => (
                                            <Table.Row
                                                key={node.id}
                                                className="bg-gray-800 hover:bg-gray-700"
                                            >
                                                <Table.Cell className="whitespace-nowrap font-medium text-gray-200">
                                                    <div className="flex items-center space-x-2">
                                                        <HiOutlineCollection className="h-4 w-4 text-blue-400" />
                                                        <span>{node.name}</span>
                                                    </div>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {node.tags &&
                                                        node.tags.length > 0 ? (
                                                            node.tags.map(
                                                                (tag) => (
                                                                    <Badge
                                                                        key={
                                                                            tag
                                                                        }
                                                                        color="purple"
                                                                        icon={
                                                                            HiTag
                                                                        }
                                                                    >
                                                                        {tag}
                                                                    </Badge>
                                                                )
                                                            )
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">
                                                                {t('No tags')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <HiOutlineCollection className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">
                                    {t('No nodes found')}
                                </p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="py-8">
                                <CustomPagination
                                    currentPage={page || 1}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    )
}
