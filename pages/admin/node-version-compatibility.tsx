import React, { Suspense, useState } from 'react'
import {
    useListAllNodeVersions,
    useListAllNodes,
    useAdminUpdateNodeVersion,
    NodeVersion,
    NodeVersionStatus,
    listAllNodes,
    Node,
    getNode,
    useGetNode,
    getGetNodeQueryOptions,
} from '@/src/api/generated'
import {
    Button,
    Table,
    TextInput,
    Label,
    Spinner,
    Breadcrumb,
    Dropdown,
    Checkbox,
    Flowbite,
    Tooltip,
} from 'flowbite-react'
import withAdmin from '@/components/common/HOC/authAdmin'
import { useNextTranslation } from '@/src/hooks/i18n'
import router from 'next/router'
import { HiHome } from 'react-icons/hi'
import NodeVersionCompatibilityEditModal from '@/components/admin/NodeVersionCompatibilityEditModal'
import { CustomPagination } from '@/components/common/CustomPagination'
import { useSearchParameter } from '@/src/hooks/useSearchParameter'
import { NodeVersionStatusToReadable } from '@/src/mapper/nodeversion'
import NodeVersionStatusBadge from '@/components/nodes/NodeVersionStatusBadge'
import { usePage } from '@/components/hooks/usePage'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useAsync, useAsyncFn, useMap } from 'react-use'
import sflow, { pageFlow } from 'sflow'
import DIE, { DIES } from 'phpdie'

// This page allows admins to update node version compatibility fields
export default withAdmin(NodeVersionCompatibilityAdmin)

function NodeVersionCompatibilityAdmin() {
    const { t } = useNextTranslation()
    const [_page, setPage] = usePage()

    // search
    const [nodeId, setNodeId] = useSearchParameter<string | undefined>(
        'nodeId',
        (p) => p || undefined,
        (v) => v || []
    )
    const [version, setVersion] = useSearchParameter<string | undefined>(
        'version',
        (p) => p || undefined,
        (v) => v || []
    )
    const [statuses, setStatuses] = useSearchParameter<NodeVersionStatus[]>(
        'status',
        (...p) => p.filter((e) => NodeVersionStatus[e]) as NodeVersionStatus[],
        (v) => v || []
    )

    const adminUpdateNodeVersion = useAdminUpdateNodeVersion()

    const [
        updateAllNodeVersionsWithLatestState,
        updateAllNodeVersionsWithLatest,
    ] = useAsyncFn(async () => {
        await pageFlow(1, async (page, limit = 100) => {
            const data =
                (await listAllNodes({ page, limit, latest: true })).nodes || []
            return { data, next: data.length === limit ? page + 1 : null }
        })
            .flat()
            .forEach(async (node) => {
                if (
                    !node.latest_version ||
                    !node.id ||
                    !node.latest_version.version
                )
                    return

                const latestVersion = node.latest_version
                await adminUpdateNodeVersion.mutateAsync({
                    nodeId: node.id,
                    versionNumber: latestVersion.version!,
                    data: {
                        supported_comfyui_frontend_version:
                            latestVersion.supported_comfyui_frontend_version,
                        supported_comfyui_version:
                            latestVersion.supported_comfyui_version,
                        supported_os: latestVersion.supported_os,
                        supported_accelerators:
                            latestVersion.supported_accelerators,
                    },
                })
            })
            .run()
    }, [])

    return (
        <div className="py-4 max-w-full relative dark">
            <div className="py-4">
                <Breadcrumb>
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
                        {t('Node Version Compatibility')}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-white">
                {t('Node Version Compatibility Admin')}
            </h1>

            <form
                className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                onSubmit={(e) => {
                    console.log('Form submitted')
                    e.preventDefault()
                    const formData = new FormData(e.target as HTMLFormElement)
                    const nodeVersionFilter =
                        formData.get('filter-node-version') || ''
                    const [nodeId, version] = nodeVersionFilter
                        .toString()
                        .split('@')
                        .map((s) => s.trim())
                    console.log([...formData.entries()])
                    setNodeId(nodeId)
                    setVersion(version)
                    setStatuses(
                        formData.getAll('status') as NodeVersionStatus[]
                    )
                    setPage(undefined) // Reset to first page on filter change
                    console.log('Form submitted OK')
                }}
            >
                <div className="flex items-center">
                    <Label htmlFor="filter-node-version" className="mr-2">
                        {t('Filter by Node Version')}
                    </Label>
                    <TextInput
                        id="filter-node-version"
                        name="filter-node-version"
                        placeholder={t('Filter by [node-id]@[version]')}
                        className="inline-block w-64"
                        defaultValue={
                            nodeId && version
                                ? `${nodeId}@${version}`
                                : nodeId
                                  ? `${nodeId}`
                                  : ''
                        }
                    />
                </div>
                <div className="flex items-center">
                    <Label htmlFor="statuses" className="mr-2">
                        {t('Filter by Statuses')}
                    </Label>
                    <Dropdown
                        label={
                            statuses.length > 0
                                ? statuses
                                      .map((status) =>
                                          NodeVersionStatusToReadable({
                                              status,
                                          })
                                      )
                                      .join(', ')
                                : t('Select Statuses')
                        }
                        className="inline-block w-64"
                        value={statuses.length > 0 ? statuses : undefined}
                    >
                        {Object.values(NodeVersionStatus).map((status) => (
                            <Dropdown.Item
                                key={status}
                                onClick={() => {
                                    setStatuses((prev) =>
                                        prev.includes(status)
                                            ? prev.filter((s) => s !== status)
                                            : [...prev, status]
                                    )
                                }}
                            >
                                <Checkbox
                                    id={`status-${status}`}
                                    name="status"
                                    value={status}
                                    checked={statuses.includes(status)}
                                    className="mr-2"
                                />
                                <Label htmlFor={`status-${status}`}>
                                    {NodeVersionStatusToReadable({ status })}
                                </Label>
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Item
                            value={[]}
                            onClick={() => {
                                setStatuses([])
                            }}
                        >
                            <Label>{t('Clear')}</Label>
                        </Dropdown.Item>
                    </Dropdown>
                </div>
                <Button type="submit" color="primary">
                    {t('Apply Filters')}
                </Button>
                <Label>{t('Clear')}</Label>
            </form>

            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
                            {t('Bulk Update Supported Versions')}
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                            {t(
                                'One-Time Migration: Update all node versions with their latest supported ComfyUI versions, OS, and accelerators'
                            )}
                        </p>
                    </div>
                    <Button
                        color="warning"
                        onClick={updateAllNodeVersionsWithLatest}
                        disabled={updateAllNodeVersionsWithLatestState.loading}
                        isProcessing={
                            updateAllNodeVersionsWithLatestState.loading
                        }
                    >
                        {updateAllNodeVersionsWithLatestState.loading
                            ? t('Updating All Versions...')
                            : t('Update All Node Versions')}
                    </Button>
                </div>
            </div>

            <Suspense fallback={<Spinner />}>
                <DataTable
                    nodeId={nodeId}
                    version={version}
                    statuses={statuses}
                />
            </Suspense>
        </div>
    )
}

function DataTable({
    nodeId,
    version,
    statuses,
}: {
    nodeId?: string
    version?: string
    statuses?: NodeVersionStatus[]
}) {
    const [page, setPage] = usePage()
    const { t } = useNextTranslation()

    const { data, isLoading, isError, refetch } = useListAllNodeVersions({
        page: page,
        pageSize: 24,
        statuses,
        nodeId,
        // version, // TODO: implement version filtering in backend
    })

    const versions =
        data?.versions?.filter((v) =>
            !version ? true : v.version === version
        ) || []

    const [editing, setEditing] = useSearchParameter<string>(
        'editing',
        (v) => v || '',
        (v) => v || []
    )
    const editingNodeVersion =
        versions.find((v) => `${v.node_id}@${v.version}` === editing) || null

    // fill node info <nodeId, node>
    const [nodeInfoMap, nodeInfoMapActions] = useMap<Record<string, Node>>({})
    const qc = useQueryClient()
    useAsync(async () => {
        return await sflow(versions || [])
            .map(async (version) => {
                const nodeId =
                    version.node_id ||
                    DIES(
                        toast.error,
                        `Missing node_id for node version ${JSON.stringify(version)}`
                    )
                const node = await qc.fetchQuery({
                    ...getGetNodeQueryOptions(nodeId),
                })
                nodeInfoMapActions.set(nodeId, node)
            })
            .toArray()
    }, [versions])

    if (isLoading)
        return (
            <div className="flex-grow flex justify-center items-center h-[50vh]">
                <Spinner />
            </div>
        )
    if (isError) return <div>{t('Error loading node versions')}</div>

    const handleEdit = (nv: NodeVersion) => {
        setEditing(`${nv.node_id}@${nv.version}`)
    }

    const handleCloseModal = () => {
        setEditing('')
    }

    const handleSuccess = () => {
        refetch()
    }

    return (
        <>
            <Table
                theme={{
                    root: { wrapper: 'overflow-x-auto relative' },
                }}
                className="bg-gray-900 text-white dark:bg-gray-900 dark:text-white"
            >
                <Table.Head className="sticky top-0 bg-gray-800 text-white">
                    <Table.HeadCell className="sticky left-0 z-10 bg-gray-800">
                        {t('Node Version')}
                    </Table.HeadCell>
                    <Table.HeadCell>{t('Latest Version')}</Table.HeadCell>
                    <Table.HeadCell>{t('ComfyUI Frontend')}</Table.HeadCell>
                    <Table.HeadCell>{t('ComfyUI')}</Table.HeadCell>
                    <Table.HeadCell>{t('OS')}</Table.HeadCell>
                    <Table.HeadCell>{t('Accelerators')}</Table.HeadCell>
                    <Table.HeadCell>{t('Actions')}</Table.HeadCell>
                </Table.Head>
                <Table.Body className="max-w-full overflow-auto">
                    {versions?.map((nv) => {
                        const node = nv.node_id ? nodeInfoMap[nv.node_id] : null
                        const latestVersion = node?.latest_version
                        const isLatest = latestVersion?.version === nv.version

                        const compatibilityInfo = latestVersion ? (
                            <div className="text-sm">
                                <div className="font-semibold mb-2">
                                    {t('Latest Version')}:{' '}
                                    {latestVersion.version}
                                </div>
                                <div className="space-y-1">
                                    <div>
                                        <span className="font-medium">
                                            {t('ComfyUI Frontend')}:
                                        </span>{' '}
                                        {latestVersion.supported_comfyui_frontend_version ||
                                            t('Not specified')}
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {t('ComfyUI')}:
                                        </span>{' '}
                                        {latestVersion.supported_comfyui_version ||
                                            t('Not specified')}
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {t('OS')}:
                                        </span>{' '}
                                        {latestVersion.supported_os?.join(
                                            ', '
                                        ) || t('Not specified')}
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            {t('Accelerators')}:
                                        </span>{' '}
                                        {latestVersion.supported_accelerators?.join(
                                            ', '
                                        ) || t('Not specified')}
                                    </div>
                                </div>
                                {isLatest && (
                                    <div className="mt-2 text-green-400 font-medium">
                                        {t('This is the latest version')}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-sm">
                                {t('Latest version information not available')}
                            </div>
                        )

                        return (
                            <Table.Row key={nv.id}>
                                <Table.Cell className="sticky left-0 z-10 bg-gray-800">
                                    {nv.node_id}@{nv.version}
                                </Table.Cell>
                                <Table.Cell>
                                    {latestVersion ? (
                                        <Tooltip
                                            content={compatibilityInfo}
                                            className="max-w-md"
                                            placement="right"
                                        >
                                            <div className="cursor-help inline-flex items-center gap-2">
                                                <span
                                                    className={
                                                        isLatest
                                                            ? 'text-green-400 font-medium'
                                                            : ''
                                                    }
                                                >
                                                    {latestVersion.version}
                                                </span>
                                                {isLatest && (
                                                    <span className="text-xs bg-green-600 px-2 py-0.5 rounded">
                                                        {t('Latest')}
                                                    </span>
                                                )}
                                            </div>
                                        </Tooltip>
                                    ) : (
                                        <span className="text-gray-500">
                                            {t('Loading...')}
                                        </span>
                                    )}
                                </Table.Cell>
                                <Table.Cell>
                                    {nv.supported_comfyui_frontend_version ||
                                        ''}
                                </Table.Cell>
                                <Table.Cell>
                                    {nv.supported_comfyui_version || ''}
                                </Table.Cell>
                                <Table.Cell>
                                    <code className="whitespace-pre overflow-auto">
                                        {nv.supported_os?.join('\n') || ''}
                                    </code>
                                </Table.Cell>
                                <Table.Cell>
                                    <code className="whitespace-pre overflow-auto">
                                        {nv.supported_accelerators?.join(
                                            '\n'
                                        ) || ''}
                                    </code>
                                </Table.Cell>
                                <Table.Cell>
                                    <Button
                                        size="xs"
                                        onClick={() => handleEdit(nv)}
                                        color="primary"
                                    >
                                        {t('Edit')}
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>

            <div className="pb-8">
                <CustomPagination
                    currentPage={page || 1}
                    totalPages={data?.totalPages || 1}
                    onPageChange={setPage}
                />
            </div>

            <NodeVersionCompatibilityEditModal
                isOpen={!!editingNodeVersion}
                onClose={handleCloseModal}
                nodeVersion={editingNodeVersion}
                onSuccess={handleSuccess}
            />
        </>
    )
}
