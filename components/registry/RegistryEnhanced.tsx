import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/router'
import { Button, TextInput, Select, Card, Badge, Spinner } from 'flowbite-react'
import { HiSearch, HiDownload, HiStar, HiLightningBolt } from 'react-icons/hi'
import Image from 'next/image'
import { useNextTranslation } from '@/src/hooks/i18n'
import nodesLogo from '@/src/assets/images/nodesLogo.svg'
import { formatDownloadCount } from '../nodes/NodeDetails'

// New TanStack DB hooks
import {
    useNodesLive,
    useNodesSearch,
    useNodeStats,
    useNodeMutations,
} from '@/src/db/hooks-v2'
import { useComfyDB } from '@/src/db/provider-v2'
import type { Node } from '@/src/api/generated'

interface FilterOptions {
    search: string
    sortBy: 'downloads' | 'rating' | 'created_at' | 'name'
    category?: string
    deprecated: boolean | null
    minRating: number
}

const RegistryEnhanced: React.FC = () => {
    const { t } = useNextTranslation()
    const router = useRouter()
    const { isInitialized } = useComfyDB()
    const { incrementDownloads } = useNodeMutations()

    // Filter state
    const [filters, setFilters] = useState<FilterOptions>({
        search: '',
        sortBy: 'downloads',
        category: undefined,
        deprecated: false,
        minRating: 0,
    })

    // Pagination state
    const [page, setPage] = useState(1)
    const pageSize = 20

    // Use enhanced TanStack DB live queries with real-time updates
    const liveNodes = useNodesLive({
        where:
            filters.deprecated === null
                ? undefined
                : { latest_version: { deprecated: filters.deprecated } as any },
        orderBy:
            filters.sortBy === 'downloads'
                ? 'downloads'
                : (filters.sortBy as keyof Node),
        limit: pageSize * page,
    })

    // Enhanced search with live filtering
    const searchResults = useNodesSearch(filters.search, {
        category: filters.category,
        deprecated: filters.deprecated || undefined,
        minRating: filters.minRating > 0 ? filters.minRating : undefined,
    })

    // Live statistics
    const stats = useNodeStats()

    // Use search results if searching, otherwise use live nodes
    const displayNodes = filters.search ? searchResults : liveNodes

    // Paginated nodes
    const paginatedNodes = useMemo(() => {
        const nodes = Array.isArray(displayNodes) ? displayNodes : []
        return nodes.slice(0, pageSize * page)
    }, [displayNodes, pageSize, page])

    const handleNodeClick = async (node: Node) => {
        // Optimistic update - increment downloads immediately
        if (node.id) {
            await incrementDownloads(node.id)
        }

        // Navigate to node details
        router.push(`/nodes/${node.id}`)
    }

    const handleLoadMore = () => {
        setPage((prev) => prev + 1)
    }

    const hasMore =
        Array.isArray(displayNodes) &&
        paginatedNodes.length < displayNodes.length

    if (!isInitialized) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="xl" />
                <span className="ml-2">Initializing TanStack DB...</span>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header with Live Stats */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{t('Node Registry')}</h1>
                    <HiLightningBolt className="text-yellow-400 text-2xl animate-pulse" />
                </div>
                <p className="text-gray-600 mb-4">
                    {t(
                        'Browse and discover ComfyUI custom nodes with real-time updates'
                    )}
                </p>

                {/* Live Statistics */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.totalNodes}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {t('Total Nodes')}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatDownloadCount(stats.totalDownloads)}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {t('Total Downloads')}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {stats.avgRating.toFixed(1)}★
                                </div>
                                <div className="text-sm text-gray-500">
                                    {t('Avg Rating')}
                                </div>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.activeNodes}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {t('Active Nodes')}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Badge color="success" className="animate-pulse">
                        <HiLightningBolt className="mr-1" />
                        {t('Live Updates Active')}
                    </Badge>
                    {Array.isArray(displayNodes) && (
                        <Badge color="info">
                            {t('{{count}} nodes found', {
                                count: displayNodes.length,
                            })}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <TextInput
                            icon={HiSearch}
                            placeholder={t('Search nodes in real-time...')}
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
                        <option value="name">{t('Alphabetical')}</option>
                    </Select>

                    {/* Category Filter */}
                    <Select
                        value={filters.category || ''}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                category: e.target.value || undefined,
                            }))
                        }
                    >
                        <option value="">{t('All Categories')}</option>
                        <option value="utility">{t('Utility')}</option>
                        <option value="image">{t('Image Processing')}</option>
                        <option value="ai">{t('AI/ML')}</option>
                        <option value="workflow">{t('Workflow')}</option>
                    </Select>

                    {/* Deprecated Filter */}
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

                    {/* Rating Filter */}
                    <Select
                        value={filters.minRating.toString()}
                        onChange={(e) =>
                            setFilters((prev) => ({
                                ...prev,
                                minRating: parseInt(e.target.value),
                            }))
                        }
                    >
                        <option value="0">{t('Any Rating')}</option>
                        <option value="3">{t('3+ Stars')}</option>
                        <option value="4">{t('4+ Stars')}</option>
                        <option value="5">{t('5 Stars Only')}</option>
                    </Select>
                </div>
            </div>

            {/* Live Node Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedNodes.map((node) => (
                    <Card
                        key={node.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                        onClick={() => handleNodeClick(node)}
                    >
                        <div className="flex items-start gap-3">
                            <div className="relative">
                                <Image
                                    src={node.icon || nodesLogo}
                                    alt={node.name || 'Node'}
                                    width={48}
                                    height={48}
                                    className="rounded-lg flex-shrink-0"
                                />
                                {/* Live update indicator */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
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

                        {/* Category Badge */}
                        {node.category && (
                            <Badge
                                color="purple"
                                size="sm"
                                className="mt-2 w-fit"
                            >
                                {node.category}
                            </Badge>
                        )}

                        {/* Live Stats - Updates in Real-Time! */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                {/* Downloads with live updates */}
                                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                                    <HiDownload className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium text-blue-600">
                                        {formatDownloadCount(
                                            node.downloads || 0
                                        )}
                                    </span>
                                </div>

                                {/* Rating */}
                                {node.rating !== null &&
                                    node.rating !== undefined && (
                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                                            <HiStar className="w-4 h-4 text-yellow-400" />
                                            <span className="font-medium text-yellow-600">
                                                {node.rating.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                            </div>

                            {/* Status Badge */}
                            {node.latest_version?.deprecated && (
                                <Badge color="warning" size="xs">
                                    {t('Deprecated')}
                                </Badge>
                            )}
                        </div>

                        {/* Latest Version */}
                        {node.latest_version && (
                            <div className="text-xs text-gray-400 mt-2 flex justify-between">
                                <span>v{node.latest_version.version}</span>
                                <span>
                                    {new Date(
                                        node.latest_version.createdAt || ''
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
                <div className="flex justify-center mt-8">
                    <Button onClick={handleLoadMore} color="gray" size="lg">
                        <HiLightningBolt className="mr-2" />
                        {t('Load More Nodes')}
                    </Button>
                </div>
            )}

            {/* Empty State */}
            {!paginatedNodes.length && displayNodes && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg">
                        {filters.search
                            ? t('No nodes found matching your search')
                            : t('No nodes available')}
                    </p>
                    {filters.search && (
                        <Button
                            color="gray"
                            onClick={() =>
                                setFilters((prev) => ({ ...prev, search: '' }))
                            }
                            className="mt-4"
                        >
                            {t('Clear Search')}
                        </Button>
                    )}
                </div>
            )}

            {/* Live Status Indicator */}
            <div className="fixed bottom-4 right-4 z-50">
                <Badge color="success" className="animate-pulse shadow-lg">
                    <HiLightningBolt className="mr-1" />
                    {t('Live Sync Active')}
                </Badge>
            </div>
        </div>
    )
}

export default RegistryEnhanced
