import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import {
  Breadcrumb,
  Button,
  Checkbox,
  Dropdown,
  Flowbite,
  Label,
  Spinner,
  Table,
  TextInput,
  Tooltip,
} from 'flowbite-react'
import router from 'next/router'
import DIE, { DIES } from 'phpdie'
import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { HiHome } from 'react-icons/hi'
import { toast } from 'react-toastify'
import { useAsync, useAsyncFn, useMap } from 'react-use'
import sflow, { pageFlow } from 'sflow'
import NodeVersionCompatibilityEditModal from '@/components/admin/NodeVersionCompatibilityEditModal'
import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { usePage } from '@/components/hooks/usePage'
import NodeVersionStatusBadge from '@/components/nodes/NodeVersionStatusBadge'
import {
  adminUpdateNode,
  getGetNodeQueryKey,
  getGetNodeQueryOptions,
  getGetNodeVersionQueryKey,
  getListAllNodesQueryKey,
  getListAllNodesQueryOptions,
  getListAllNodeVersionsQueryKey,
  getListNodeVersionsQueryKey,
  getNode,
  listAllNodes,
  Node,
  NodeVersion,
  NodeVersionStatus,
  useAdminUpdateNode,
  useAdminUpdateNodeVersion,
  useGetNode,
  useListAllNodes,
  useListAllNodeVersions,
  useUpdateNode,
} from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useSearchParameter } from '@/src/hooks/useSearchParameter'
import { NodeVersionStatusToReadable } from '@/src/mapper/nodeversion'

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
  const adminUpdateNode = useAdminUpdateNode()

  const qc = useQueryClient()
  const [checkAllNodeVersionsWithLatestState, checkAllNodeVersionsWithLatest] =
    useAsyncFn(async () => {
      const ac = new AbortController()
      await pageFlow(1, async (page, limit = 100) => {
        const data =
          (
            await qc.fetchQuery(
              getListAllNodesQueryOptions({
                page,
                limit,
                latest: true,
              })
            )
          ).nodes || []

        return { data, next: data.length === limit ? page + 1 : null }
      })
        .terminateSignal(ac.signal)
        // .limit(1)
        .flat()
        .filter((e) => e.latest_version)
        .map(async (node) => {
          node.id || DIES(toast.error, `missing node id${JSON.stringify(node)}`)
          node.latest_version ||
            DIES(toast.error, `missing latest_version${JSON.stringify(node)}`)
          node.latest_version?.version ||
            DIES(
              toast.error,
              `missing latest_version.version${JSON.stringify(node)}`
            )

          const isOutdated = isNodeCompatibilityInfoOutdated(node)
          return { nodeId: node.id, isOutdated, node }
        })
        .filter()
        .log()
        .toArray()
        .then((e) => console.log(`${e.length} results`))
      return () => ac.abort()
    }, [])
  useAsync(async () => {
    if (!!nodeId) return
    const ac = new AbortController()
    let i = 0
    await pageFlow(1, async (page, limit = 100) => {
      ac.signal.aborted && DIES(toast.error, 'aborted')
      const data =
        (
          await qc.fetchQuery(
            getListAllNodesQueryOptions({
              page,
              limit,
              latest: true,
            })
          )
        ).nodes || []
      return { data, next: data.length === limit ? page + 1 : null }
    })
      // .terminateSignal(ac.signal)
      // .limit(1)
      .flat()
      .filter((e) => e.latest_version)
      .map(async (node) => {
        node.id || DIES(toast.error, `missing node id${JSON.stringify(node)}`)
        node.latest_version ||
          DIES(toast.error, `missing latest_version${JSON.stringify(node)}`)
        node.latest_version?.version ||
          DIES(
            toast.error,
            `missing latest_version.version${JSON.stringify(node)}`
          )

        const isOutdated = isNodeCompatibilityInfoOutdated(node)
        return { nodeId: node.id, isOutdated, node }
      })
      .filter()
      .log((x, i) => i)
      .log()
      .toArray()
      .then((e) => {
        // all
        console.log(`got ${e.length} results`)
        // outdated
        console.log(
          `got ${e.filter((x) => x.isOutdated).length} outdated results`
        )

        const outdatedList = e.filter((x) => x.isOutdated)
        console.log(outdatedList)
        console.log(e.filter((x) => x.nodeId === 'img2colors-comfyui-node'))
        console.log(async () => {
          outdatedList.map(async (x) => {
            const node = x.node
            const isOutdated = x.isOutdated
            // Do something with the outdated node
            console.log(`${x.nodeId} is outdated`)
          })
        })
      })
    return () => ac.abort()
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
          const nodeVersionFilter = formData.get('filter-node-version') || ''
          const [nodeId, version] = nodeVersionFilter
            .toString()
            .split('@')
            .map((s) => s.trim())
          console.log([...formData.entries()])
          setNodeId(nodeId)
          setVersion(version)
          setStatuses(formData.getAll('status') as NodeVersionStatus[])
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

      <div className="hidden mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
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
            color="success"
            onClick={checkAllNodeVersionsWithLatest}
            disabled={checkAllNodeVersionsWithLatestState.loading}
            isProcessing={checkAllNodeVersionsWithLatestState.loading}
          >
            {checkAllNodeVersionsWithLatestState.loading
              ? t('Checking All Versions...')
              : t('Check All Node Versions')}
          </Button>
          {/* <Button
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
                    </Button> */}
        </div>
      </div>

      <Suspense fallback={<Spinner />}>
        <DataTable nodeId={nodeId} version={version} statuses={statuses} />
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
    pageSize: 100,
    statuses,
    nodeId,
    // version, // TODO: implement version filtering in backend
  })

  const versions = useMemo(
    () =>
      data?.versions?.filter((v) =>
        !version ? true : v.version === version
      ) || [],
    [data?.versions]
  )

  const [editing, setEditing] = useSearchParameter<string>(
    'editing',
    (v) => v || '',
    (v) => v || [],
    { history: 'replace' }
  )
  const editingNodeVersion =
    versions.find((v) => `${v.node_id}@${v.version}` === editing) || null

  // fill node info <nodeId, node>
  const [nodeInfoMap, nodeInfoMapActions] = useMap<Record<string, Node>>({})
  const qc = useQueryClient()
  useAsync(async () => {
    await sflow(versions)
      .map((e) => e.node_id)
      .filter()
      .uniq()
      .map(async (nodeId) => {
        const node = await qc.fetchQuery({
          ...getGetNodeQueryOptions(nodeId),
        })
        // const nodeWithNoCache =
        //     (
        //         await qc.fetchQuery({
        //             ...getListAllNodesQueryOptions({
        //                 node_id: [nodeId],
        //             }),
        //         })
        //     ).nodes?.[0] ||
        //     DIES(toast.error, 'Node not found: ' + nodeId)
        nodeInfoMapActions.set(nodeId, node)
      })
      .run()
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
        <Table.Head className="sticky top-0 bg-gray-800 text-white z-30">
          <Table.HeadCell className="sticky left-0 z-20 bg-gray-800">
            {t('Node Version')}
          </Table.HeadCell>
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
            const isOutdated = isLatest && isNodeCompatibilityInfoOutdated(node)
            const compatibilityInfo = latestVersion ? (
              <div className="text-sm w-[50vw] z-100 ml-4">
                <div className="font-semibold mb-2">
                  {t('Latest Version')}: {latestVersion.version}
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="font-medium">
                      {t('ComfyUI Frontend')}:
                    </span>{' '}
                    {node.supported_comfyui_frontend_version ||
                      t('Not specified')}
                  </div>
                  <div>
                    <span className="font-medium">{t('ComfyUI')}:</span>{' '}
                    {node.supported_comfyui_version || t('Not specified')}
                  </div>
                  <div>
                    <span className="font-medium">{t('OS')}:</span>{' '}
                    {node.supported_os?.join(', ') || t('Not specified')}
                  </div>
                  <div>
                    <span className="font-medium">{t('Accelerators')}:</span>{' '}
                    {node.supported_accelerators?.join(', ') ||
                      t('Not specified')}
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
                <Table.Cell className="sticky left-0 z-10 bg-gray-800 flex flex-row gap-2 justify-between">
                  {nv.node_id}@{nv.version}
                  <div className="flex flex-row gap-2">
                    {isOutdated && (
                      <span
                        className="text-red-500"
                        onClick={async (e) => {
                          const self = e.currentTarget
                          if (!latestVersion)
                            DIES(toast.error, 'No latest version')
                          if (!isLatest)
                            DIES(toast.error, 'Not the latest version')
                          self.classList.add('animate-pulse')

                          await adminUpdateNode(node?.id!, {
                            ...node,
                            supported_accelerators: nv.supported_accelerators,
                            supported_comfyui_frontend_version:
                              nv.supported_comfyui_frontend_version,
                            supported_comfyui_version:
                              nv.supported_comfyui_version,
                            supported_os: nv.supported_os,
                            latest_version: undefined,
                          })
                          // clean cache
                          qc.invalidateQueries({
                            queryKey: getGetNodeQueryKey(node.id!),
                          })
                          qc.invalidateQueries({
                            queryKey: getGetNodeVersionQueryKey(node.id!),
                          })
                          qc.invalidateQueries({
                            queryKey: getListAllNodesQueryKey({
                              node_id: [node.id!],
                            }),
                          })
                          qc.invalidateQueries({
                            queryKey: getListAllNodeVersionsQueryKey({
                              nodeId: node.id,
                            }),
                          })
                          qc.invalidateQueries({
                            queryKey: getListNodeVersionsQueryKey(node.id!),
                          })

                          self.classList.remove('animate-pulse')
                        }}
                      >
                        {t('Version Info Outdated')}
                      </span>
                    )}
                    {latestVersion ? (
                      <Tooltip
                        content={compatibilityInfo}
                        className="max-w-md"
                        placement="right"
                      >
                        <div className="cursor-help inline-flex items-center gap-2">
                          <span
                            className={clsx('text-xs px-2 py-0.5 rounded', {
                              'bg-green-600': isLatest,
                              'bg-gray-600': !isLatest,
                            })}
                          >
                            {t('Latest: {{version}}', {
                              version: latestVersion.version,
                            })}
                          </span>
                        </div>
                      </Tooltip>
                    ) : (
                      <span className="text-gray-500">{t('Loading...')}</span>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {nv.supported_comfyui_frontend_version || ''}
                </Table.Cell>
                <Table.Cell>{nv.supported_comfyui_version || ''}</Table.Cell>
                <Table.Cell>
                  <code className="whitespace-pre overflow-auto">
                    {nv.supported_os?.join('\n') || ''}
                  </code>
                </Table.Cell>
                <Table.Cell>
                  <code className="whitespace-pre overflow-auto">
                    {nv.supported_accelerators?.join('\n') || ''}
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
function isNodeCompatibilityInfoOutdated(node: Node | null) {
  return (
    JSON.stringify(node?.supported_comfyui_frontend_version) !==
      JSON.stringify(
        node?.latest_version?.supported_comfyui_frontend_version
      ) ||
    JSON.stringify(node?.supported_comfyui_version) !==
      JSON.stringify(node?.latest_version?.supported_comfyui_version) ||
    JSON.stringify(node?.supported_os || []) !==
      JSON.stringify(node?.latest_version?.supported_os || []) ||
    JSON.stringify(node?.supported_accelerators || []) !==
      JSON.stringify(node?.latest_version?.supported_accelerators || []) ||
    false
  )
}
