import withAdmin from '@/components/common/HOC/authAdmin'
import AdminTreeNavigation from '@/components/admin/AdminTreeNavigation'
import { CustomPagination } from '@/components/common/CustomPagination'
import { usePage } from '@/components/hooks/usePage'
import { useListAllNodes } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb, Card, Badge } from 'flowbite-react'
import { HiHome, HiOutlineCollection } from 'react-icons/hi'
import React, { useMemo, useState } from 'react'

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

    const tagsData = useMemo(() => {
        if (!nodesData?.nodes) return []

        const tagMap = new Map<string, number>()
        nodesData.nodes.forEach((node) => {
            // Use tags array instead of category
            if (node.tags && node.tags.length > 0) {
                node.tags.forEach((tag) => {
                    tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
                })
            } else if (node.category) {
                // Fallback to category if tags are not available
                const category = node.category || 'Uncategorized'
                tagMap.set(category, (tagMap.get(category) || 0) + 1)
            } else {
                // If neither tags nor category are available
                tagMap.set(
                    'Uncategorized',
                    (tagMap.get('Uncategorized') || 0) + 1
                )
            }
        })

        return Array.from(tagMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)
    }, [nodesData?.nodes])

    const totalPages = Math.ceil((nodesData?.total || 0) / limit)

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
                                {t('Node Tags Overview')}
                            </h2>
                            <Badge color="info" icon={HiOutlineCollection}>
                                {tagsData.length} {t('tags')}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            {tagsData.map(({ tag, count }) => (
                                <div
                                    key={tag}
                                    className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <HiOutlineCollection className="h-5 w-5 text-blue-400" />
                                        <span className="text-lg font-medium text-gray-200">
                                            {tag}
                                        </span>
                                    </div>
                                    <Badge color="purple" size="sm">
                                        {count} {t('nodes')}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        {tagsData.length === 0 && (
                            <div className="text-center py-8">
                                <HiOutlineCollection className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400">
                                    {t('No tags found')}
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
