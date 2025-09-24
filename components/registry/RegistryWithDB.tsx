import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button, TextInput, Select, Card, Badge, Spinner } from 'flowbite-react'
import { HiSearch, HiDownload, HiStar } from 'react-icons/hi'
import Image from 'next/image'
import { useNextTranslation } from '@/src/hooks/i18n'
import nodesLogo from '@/src/assets/images/nodesLogo.svg'
import { formatDownloadCount } from '../nodes/NodeDetails'

// TanStack DB imports
import { useNodesLive } from '@/src/db/hooks'
import { dbSync } from '@/src/db/sync'
import { useComfyDB } from '@/src/db/provider'
import type { Node } from '@/src/db/schema'

// Still use React Query for initial data fetch
import { useListAllNodes } from '@/src/api/generated'

interface FilterOptions {
    search: string
    sortBy: 'downloads' | 'rating' | 'created_at' | 'updated_at'
    deprecated: boolean | null
    publisherId?: string
}

const RegistryWithDB: React.FC = () => {
    const { t } = useNextTranslation()
    const router = useRouter()
    const { isInitialized } = useComfyDB()

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        sortBy: 'downloads',
        deprecated: false,
        publisherId: undefined,
    })

    // Pagination state
    const [page, setPage] = useState(1)
    const pageSize = 20

    // Use TanStack DB for live queries with filtering and sorting
    const liveNodes = useNodesLive({
        where:
            filters.deprecated === null
                ? undefined
                : { deprecated: filters.deprecated },
        orderBy:
            filters.sortBy === 'downloads'
                ? 'total_downloads'
                : (filters.sortBy as keyof Node),
        limit: pageSize * page,
    })

    // Initial data fetch from API to populate DB
    const { data: apiData, isLoading: apiLoading } = useListAllNodes(
        {
            limit: 100,
            page: 1,
        },
        {
            query: {
                refetchInterval: 30000, // Refetch every 30 seconds for updates
            },
        }
    )

    // Sync API data to TanStack DB
    useEffect(() => {
        if (apiData?.nodes && isInitialized) {
            dbSync.syncNodes(apiData.nodes).then(() => {
                console.log(
                    `Synced ${apiData.nodes?.length || 0} nodes to TanStack DB`
                )
            })
        }
    }, [apiData, isInitialized])

    // Filter nodes based on search
    const filteredNodes = React.useMemo(() => {
        if (!liveNodes) return []

        let result = [...liveNodes]

        // Apply text search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            result = result.filter(
                (node) =>
                    node.name.toLowerCase().includes(searchLower) ||
                    node.description?.toLowerCase().includes(searchLower) ||
                    node.author?.toLowerCase().includes(searchLower) ||
                    node.tags?.some((tag) =>
                        tag.toLowerCase().includes(searchLower)
                    )
            )
        }

        // Apply publisher filter
        if (filters.publisherId) {
            result = result.filter(
                (node) => node.publisher_id === filters.publisherId
            )
        }

        return result
    }, [liveNodes, filters.search, filters.publisherId])

    // Paginated nodes
    const paginatedNodes = filteredNodes.slice(0, pageSize * page)

    const handleNodeClick = (nodeId: string) => {
        // Track node click activity
        const userId = sessionStorage.getItem('userId')
        if (userId) {
            dbSync.trackActivity(userId, 'view', nodeId, 'node', {
                fromPage: 'registry',
                timestamp: Date.now(),
            })
        }

        router.push(`/nodes/${nodeId}`)
    }

    const handleLoadMore = () => {
        setPage((prev) => prev + 1)
    }

    const isLoading = apiLoading || !isInitialized
    const hasMore = paginatedNodes.length < filteredNodes.length

    if (isLoading && !liveNodes?.length) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="xl" />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('Node Registry')}
                </h1>
                <p className="text-gray-600">
                    {t('Browse and discover ComfyUI custom nodes')}
                </p>
                {liveNodes && (
                    <Badge color="success" className="mt-2">
                        {t('Live: {{count}} nodes', {
                            count: filteredNodes.length,
                        })}
                    </Badge>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <TextInput
                            icon={HiSearch}
                            placeholder={t('Search nodes...')}
                            value={filters.search}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }))
                            }
                        />
                    </div>

                    {/* Sort By */}
                    <Select
                        value={filters.sortBy}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                sortBy: e.target
                                    .value as FilterOptions['sortBy'],
                            }))
                        }
                    >
                        <option value="downloads">
                            {t('Most Downloaded')}
                        </option>
                        <option value="rating">{t('Highest Rated')}</option>
                        <option value="created_at">{t('Newest')}</option>
                        <option value="updated_at">
                            {t('Recently Updated')}
                        </option>
                    </Select>

                    {/* Show Deprecated */}
                    <Select
                        value={
                            filters.deprecated === null
                                ? 'all'
                                : filters.deprecated
                                  ? 'deprecated'
                                  : 'active'
                        }
                        onChange={(e) => {
                            const value = e.target.value
                            setFilters((prev) => ({
                                ...prev,
                                deprecated:
                                    value === 'all'
                                        ? null
                                        : value === 'deprecated',
                            }))
                        }}
                    >
                        <option value="active">{t('Active Only')}</option>
                        <option value="deprecated">
                            {t('Deprecated Only')}
                        </option>
                        <option value="all">{t('All Nodes')}</option>
                    </Select>
                </div>
            </div>

            {/* Node Grid with Live Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedNodes.map((node) => (
                    <Card
                        key={node.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleNodeClick(node.id)}
                    >
                        <div className="flex items-start gap-3">
                            <Image
                                src={node.icon || nodesLogo}
                                alt={node.name}
                                width={48}
                                height={48}
                                className="rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-lg truncate">
                                    {node.name}
                                </h3>
                                {node.author && (
                                    <p className="text-sm text-gray-500 truncate">
                                        {t('by {{author}}', {
                                            author: node.author,
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {node.description && (
                            <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                                {node.description}
                            </p>
                        )}

                        {/* Tags */}
                        {node.tags && node.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {node.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} color="gray" size="xs">
                                        {tag}
                                    </Badge>
                                ))}
                                {node.tags.length > 3 && (
                                    <Badge color="gray" size="xs">
                                        +{node.tags.length - 3}
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Stats - Live Updates! */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                {/* Downloads */}
                                <div className="flex items-center gap-1">
                                    <HiDownload className="w-4 h-4" />
                                    <span>
                                        {formatDownloadCount(
                                            node.total_downloads || 0
                                        )}
                                    </span>
                                </div>

                                {/* Rating */}
                                {node.rating !== null &&
                                    node.rating !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <HiStar className="w-4 h-4 text-yellow-400" />
                                            <span>
                                                {node.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {/* Status Badge */}
                            {node.deprecated && (
                                <Badge color="warning" size="xs">
                                    {t('Deprecated')}
                                </Badge>
                            )}
                        </div>

                        {/* Version */}
                        {node.latest_version && (
                            <div className="text-xs text-gray-400 mt-2">
                                v{node.latest_version}
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button
                        onClick={handleLoadMore}
                        color="gray"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner size="sm" className="mr-2" />
                                {t('Loading...')}
                            </>
                        ) : (
                            t('Load More')
                        )}
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredNodes.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                        {filters.search
                            ? t('No nodes found matching your search')
                            : t('No nodes available')}
                    </p>
                </div>
            )}

            {/* Live Update Indicator */}
            {liveNodes && liveNodes.length > 0 && (
                <div className="fixed bottom-4 right-4">
                    <Badge color="success" className="animate-pulse">
                        {t('Live Updates Active')}
                    </Badge>
                </div>
            )}
        </div>
    )
}

export default RegistryWithDB
