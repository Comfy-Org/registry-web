import React from 'react'
import { NextPage } from 'next'
import { Tabs, Card, Badge, Button } from 'flowbite-react'
import { HiDatabase, HiLightningBolt, HiRefresh } from 'react-icons/hi'
import RegistryWithDB from '@/components/registry/RegistryWithDB'
import NodeDetailsWithDB from '@/components/nodes/NodeDetailsWithDB'
import { useNodesLive, usePublishersLive } from '@/src/db/hooks'
import { dbSync } from '@/src/db/sync'
import { useComfyDB } from '@/src/db/provider'
import { useNextTranslation } from '@/src/hooks/i18n'

const TanStackDBDemo: NextPage = () => {
    const { t } = useNextTranslation()
    const { db, isInitialized } = useComfyDB()
    const liveNodes = useNodesLive({ limit: 5 })
    const livePublishers = usePublishersLive({ limit: 5 })

    const handleClearDB = async () => {
        if (confirm('This will clear all local TanStack DB data. Continue?')) {
            await dbSync.clearAllCollections()
            window.location.reload()
        }
    }

    const handleSyncData = async () => {
        // This would trigger a full sync from the API
        // In production, this happens automatically via interceptors
        alert('Data sync happens automatically when you browse the site!')
    }

    return (
        <div className="container mx-auto p-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                    <HiDatabase className="text-blue-600" />
                    TanStack DB Integration Demo
                </h1>
                <p className="text-gray-600 mb-4">
                    Experience real-time data synchronization and optimistic
                    updates with TanStack DB
                </p>

                <div className="flex gap-2 mb-4">
                    <Badge color={isInitialized ? 'success' : 'warning'}>
                        {isInitialized
                            ? 'DB Initialized'
                            : 'DB Initializing...'}
                    </Badge>
                    <Badge color="info">Nodes: {liveNodes?.length || 0}</Badge>
                    <Badge color="info">
                        Publishers: {livePublishers?.length || 0}
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" onClick={handleSyncData} color="blue">
                        <HiRefresh className="mr-1" />
                        Sync Data
                    </Button>
                    <Button size="sm" onClick={handleClearDB} color="failure">
                        Clear Local DB
                    </Button>
                </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <div className="flex items-start gap-3">
                        <HiLightningBolt className="text-yellow-400 text-2xl flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Live Queries</h3>
                            <p className="text-sm text-gray-600">
                                Components automatically update when data
                                changes, no manual refetch needed
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <HiDatabase className="text-blue-600 text-2xl flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">Local-First</h3>
                            <p className="text-sm text-gray-600">
                                Data persisted locally for instant loads and
                                offline support
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start gap-3">
                        <HiRefresh className="text-green-600 text-2xl flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-1">
                                Optimistic Updates
                            </h3>
                            <p className="text-sm text-gray-600">
                                UI updates instantly while syncing with the
                                server in the background
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Demo Tabs */}
            <Tabs aria-label="TanStack DB Demo">
                <Tabs.Item title="Live Registry" icon={HiDatabase}>
                    <div className="py-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Node Registry with Live Updates
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This registry component uses TanStack DB for
                            real-time updates. Try opening this page in multiple
                            tabs and watch data sync automatically!
                        </p>
                        <RegistryWithDB />
                    </div>
                </Tabs.Item>

                <Tabs.Item title="Live Queries" icon={HiLightningBolt}>
                    <div className="py-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Real-time Data Updates
                        </h2>

                        {/* Live Nodes */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-3">
                                Latest Nodes (Live)
                            </h3>
                            <div className="space-y-2">
                                {liveNodes?.map((node) => (
                                    <Card key={node.id}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium">
                                                    {node.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Downloads:{' '}
                                                    {node.total_downloads} |
                                                    Rating:{' '}
                                                    {node.rating?.toFixed(1) ||
                                                        'N/A'}
                                                </p>
                                            </div>
                                            <Badge
                                                color={
                                                    node.deprecated
                                                        ? 'warning'
                                                        : 'success'
                                                }
                                            >
                                                {node.deprecated
                                                    ? 'Deprecated'
                                                    : 'Active'}
                                            </Badge>
                                        </div>
                                    </Card>
                                ))}
                                {!liveNodes?.length && (
                                    <p className="text-gray-500">
                                        No nodes synced yet. Browse the site to
                                        sync data!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Live Publishers */}
                        <div>
                            <h3 className="text-xl font-semibold mb-3">
                                Latest Publishers (Live)
                            </h3>
                            <div className="space-y-2">
                                {livePublishers?.map((publisher) => (
                                    <Card key={publisher.id}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium">
                                                    {publisher.display_name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Nodes:{' '}
                                                    {publisher.node_count} |
                                                    Members:{' '}
                                                    {publisher.member_count}
                                                </p>
                                            </div>
                                            {publisher.website && (
                                                <a
                                                    href={publisher.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Badge color="info">
                                                        Website
                                                    </Badge>
                                                </a>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                                {!livePublishers?.length && (
                                    <p className="text-gray-500">
                                        No publishers synced yet. Browse the
                                        site to sync data!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Tabs.Item>

                <Tabs.Item title="Performance" icon={HiRefresh}>
                    <div className="py-4">
                        <h2 className="text-2xl font-semibold mb-4">
                            Performance Benefits
                        </h2>

                        <div className="space-y-4">
                            <Card>
                                <h3 className="font-semibold mb-2">
                                    ⚡ Sub-millisecond Queries
                                </h3>
                                <p className="text-gray-600">
                                    TanStack DB uses differential dataflow to
                                    compute only what changed. Updates to a
                                    sorted 100k collection take just 0.7ms on an
                                    M1 Pro.
                                </p>
                            </Card>

                            <Card>
                                <h3 className="font-semibold mb-2">
                                    🔄 Automatic Cache Sync
                                </h3>
                                <p className="text-gray-600">
                                    No more manual refetch() calls or cache
                                    invalidation. TanStack DB automatically
                                    syncs data across components and tabs.
                                </p>
                            </Card>

                            <Card>
                                <h3 className="font-semibold mb-2">
                                    📦 Local Persistence
                                </h3>
                                <p className="text-gray-600">
                                    Data is persisted to localStorage, providing
                                    instant page loads and offline support out
                                    of the box.
                                </p>
                            </Card>

                            <Card>
                                <h3 className="font-semibold mb-2">
                                    🎯 Optimistic Updates
                                </h3>
                                <p className="text-gray-600">
                                    UI updates happen instantly while the server
                                    sync happens in the background, with
                                    automatic rollback on failure.
                                </p>
                            </Card>
                        </div>
                    </div>
                </Tabs.Item>
            </Tabs>
        </div>
    )
}

export default TanStackDBDemo
