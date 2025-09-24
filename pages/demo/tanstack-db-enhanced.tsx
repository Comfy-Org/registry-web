import React from 'react'
import { NextPage } from 'next'
import { Tabs, Card, Badge, Button, Alert } from 'flowbite-react'
import {
    HiDatabase,
    HiLightningBolt,
    HiRefresh,
    HiCode,
    HiChartBar,
} from 'react-icons/hi'
import RegistryEnhanced from '@/components/registry/RegistryEnhanced'
import { useNodesLive, useNodeStats, useNodesSearch } from '@/src/db/hooks-v2'
import { useComfyDB, useCollections } from '@/src/db/provider-v2'
import { useNextTranslation } from '@/src/hooks/i18n'

const TanStackDBEnhancedDemo: NextPage = () => {
    const { t } = useNextTranslation()
    const { isInitialized } = useComfyDB()
    const stats = useNodeStats()

    // Demo queries
    const recentNodes = useNodesLive({ orderBy: 'created_at', limit: 5 })
    const topRatedNodes = useNodesLive({ orderBy: 'rating', limit: 5 })
    const searchResults = useNodesSearch('image', { minRating: 4 })

    const handleClearDB = () => {
        if (confirm('Clear all local TanStack DB data?')) {
            // Collections handle their own clearing now
            console.log('Clear functionality would be implemented here')
        }
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <HiDatabase className="text-4xl text-blue-600" />
                    <div>
                        <h1 className="text-4xl font-bold">
                            TanStack DB Enhanced Demo
                        </h1>
                        <p className="text-gray-600">
                            Experience real-time data synchronization with
                            API-backed collections
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mb-4">
                    <Badge
                        color={isInitialized ? 'success' : 'warning'}
                        size="lg"
                    >
                        <HiLightningBolt className="mr-1" />
                        {isInitialized ? 'DB Ready' : 'Initializing...'}
                    </Badge>
                    {stats && (
                        <Badge color="info" size="lg">
                            <HiChartBar className="mr-1" />
                            {stats.totalNodes} Nodes Loaded
                        </Badge>
                    )}
                </div>

                <Alert color="info" className="mb-6">
                    <HiLightningBolt className="mr-2" />
                    <span className="font-medium">Live Updates:</span> This demo
                    uses TanStack DB with API-backed collections. Data updates
                    automatically from the server and optimistic mutations
                    provide instant feedback.
                </Alert>

                <div className="flex gap-2">
                    <Button size="sm" color="failure" onClick={handleClearDB}>
                        Clear Local DB
                    </Button>
                </div>
            </div>

            {/* Feature Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <div className="flex items-start gap-3">
                        <HiLightningBolt className="text-yellow-400 text-3xl flex-shrink-0 animate-pulse" />
                        <div>
                            <h3 className="font-semibold mb-2">
                                API-Backed Collections
                            </h3>
                            <p className="text-sm text-gray-600">
                                Collections automatically sync with REST APIs
                                using queryCollectionOptions. No manual cache
                                management needed.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <HiDatabase className="text-blue-600 text-3xl flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2">Live Queries</h3>
                            <p className="text-sm text-gray-600">
                                Components subscribe to data changes and update
                                automatically. Differential dataflow ensures
                                sub-millisecond updates.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <HiRefresh className="text-green-600 text-3xl flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2">
                                Optimistic Mutations
                            </h3>
                            <p className="text-sm text-gray-600">
                                UI updates instantly while syncing with the
                                server. Automatic rollback on failure.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Demo Tabs */}
            <Tabs aria-label="TanStack DB Enhanced Demo">
                <Tabs.Item title="Enhanced Registry" icon={HiDatabase}>
                    <div className="py-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Live Registry with API-Backed Collections
                        </h2>
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">
                                ✨ New Features:
                            </h3>
                            <ul className="list-disc list-inside text-blue-700 space-y-1">
                                <li>Real-time statistics dashboard</li>
                                <li>Live search with instant results</li>
                                <li>Optimistic download counting</li>
                                <li>Advanced filtering with live updates</li>
                                <li>API-backed data synchronization</li>
                            </ul>
                        </div>
                        <RegistryEnhanced />
                    </div>
                </Tabs.Item>

                <Tabs.Item title="Live Data Queries" icon={HiLightningBolt}>
                    <div className="py-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Real-time Data Queries
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Nodes */}
                            <Card>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <HiRefresh className="mr-2 text-green-500" />
                                    Recent Nodes (Live)
                                </h3>
                                <div className="space-y-2">
                                    {Array.isArray(recentNodes) &&
                                        recentNodes.slice(0, 5).map((node) => (
                                            <div
                                                key={node.id}
                                                className="p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {node.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Downloads:{' '}
                                                            {node.downloads ||
                                                                0}{' '}
                                                            | Rating:{' '}
                                                            {node.rating?.toFixed(
                                                                1
                                                            ) || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                        ))}
                                    {(!Array.isArray(recentNodes) ||
                                        recentNodes.length === 0) && (
                                        <p className="text-gray-500 text-center py-4">
                                            Loading nodes...
                                        </p>
                                    )}
                                </div>
                            </Card>

                            {/* Top Rated Nodes */}
                            <Card>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <HiLightningBolt className="mr-2 text-yellow-500" />
                                    Top Rated Nodes (Live)
                                </h3>
                                <div className="space-y-2">
                                    {Array.isArray(topRatedNodes) &&
                                        topRatedNodes
                                            .slice(0, 5)
                                            .map((node) => (
                                                <div
                                                    key={node.id}
                                                    className="p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">
                                                                {node.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                Rating:{' '}
                                                                {node.rating?.toFixed(
                                                                    1
                                                                ) || 'N/A'}{' '}
                                                                | Downloads:{' '}
                                                                {node.downloads ||
                                                                    0}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-yellow-400">
                                                                ★
                                                            </span>
                                                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse ml-2"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    {(!Array.isArray(topRatedNodes) ||
                                        topRatedNodes.length === 0) && (
                                        <p className="text-gray-500 text-center py-4">
                                            Loading nodes...
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Live Search Results */}
                        <Card className="mt-6">
                            <h3 className="text-xl font-semibold mb-3 flex items-center">
                                <HiDatabase className="mr-2 text-blue-500" />
                                Live Search: &quot;image&quot; + Rating 4+ (
                                {Array.isArray(searchResults)
                                    ? searchResults.length
                                    : 0}{' '}
                                results)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.isArray(searchResults) &&
                                    searchResults.slice(0, 6).map((node) => (
                                        <div
                                            key={node.id}
                                            className="p-3 bg-gray-50 rounded-lg"
                                        >
                                            <h4 className="font-medium">
                                                {node.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {node.description?.substring(
                                                    0,
                                                    100
                                                )}
                                                ...
                                            </p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-400">
                                                    Rating:{' '}
                                                    {node.rating?.toFixed(1)} |
                                                    Downloads: {node.downloads}
                                                </span>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </Card>
                    </div>
                </Tabs.Item>

                <Tabs.Item title="Technical Details" icon={HiCode}>
                    <div className="py-4 space-y-6">
                        <Card>
                            <h3 className="text-xl font-semibold mb-3">
                                API-Backed Collections
                            </h3>
                            <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-sm">
                                    {`// Collection with API backend
const nodesCollection = createCollection(
  queryCollectionOptions<Node>({
    queryKey: ['nodes'],
    queryFn: async () => {
      const response = await listAllNodes({ limit: 1000 })
      return response.nodes || []
    },
    queryClient,
    getKey: (node) => node.id || '',
    refetchInterval: 30000, // Auto-sync every 30s
    onUpdate: async ({ transaction }) => {
      // Sync optimistic updates to server
      await syncToServer(transaction)
    }
  })
)`}
                                </pre>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-semibold mb-3">
                                Live Query Usage
                            </h3>
                            <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                                <pre className="text-sm">
                                    {`// Live query with complex filtering
const nodes = useLiveQuery((q) => {
  return q
    .from({ nodes: nodesCollection })
    .where(({ nodes }) => nodes.rating > 4)
    .orderBy(({ nodes }) => nodes.downloads, 'desc')
    .limit(10)
    .select(({ nodes }) => nodes)
}, [])

// Optimistic mutations
const { incrementDownloads } = useNodeMutations()
await incrementDownloads(nodeId) // Instant UI update`}
                                </pre>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-xl font-semibold mb-3">
                                Performance Benefits
                            </h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <h4 className="font-semibold text-green-800">
                                        ⚡ Sub-millisecond Updates
                                    </h4>
                                    <p className="text-green-700 text-sm">
                                        Differential dataflow updates only
                                        changed data. 0.7ms for 100k records.
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <h4 className="font-semibold text-blue-800">
                                        🔄 Automatic Sync
                                    </h4>
                                    <p className="text-blue-700 text-sm">
                                        Collections sync with APIs
                                        automatically. No manual cache
                                        invalidation.
                                    </p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <h4 className="font-semibold text-purple-800">
                                        📊 Live Queries
                                    </h4>
                                    <p className="text-purple-700 text-sm">
                                        Components subscribe to data changes and
                                        re-render only when needed.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Tabs.Item>
            </Tabs>
        </div>
    )
}

export default TanStackDBEnhancedDemo
