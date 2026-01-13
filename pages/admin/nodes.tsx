import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import {
  Breadcrumb,
  Button,
  Label,
  Modal,
  Spinner,
  Table,
  TextInput,
} from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { omit } from 'rambda'
import React, { useState } from 'react'
import { HiHome, HiOutlineX, HiPencil } from 'react-icons/hi'
import { MdOpenInNew } from 'react-icons/md'
import { toast } from 'react-toastify'
import { AdminJwtTokenModal } from '@/components/admin/AdminJwtTokenModal'
import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import {
  Node,
  NodeStatus,
  useAdminUpdateNode,
  useBanPublisherNode,
  useGetUser,
  useListAllNodes,
  useUpdateNode,
} from '@/src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { useNextTranslation } from '@/src/hooks/i18n'
import { isAdminJwtTokenValid } from '@/src/utils/adminJwtStorage'

function NodeList() {
  const { t } = useNextTranslation()
  const router = useRouter()
  const [page, setPage] = React.useState<number>(1)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [editFormData, setEditFormData] = useState({
    tags: '',
    category: '',
  })
  const [unclaimingNode, setUnclaimingNode] = useState<Node | null>(null)
  const [showJwtModal, setShowJwtModal] = useState(false)
  const [pendingBanOperation, setPendingBanOperation] = useState<{
    node: Node
    action: 'ban' | 'unban'
  } | null>(null)
  const [processingNodeId, setProcessingNodeId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: user } = useGetUser()

  // Handle page from URL
  React.useEffect(() => {
    if (router.query.page) {
      setPage(parseInt(router.query.page as string))
    }
  }, [router.query.page])

  // Status filter functionality
  const statusFlags = {
    active: NodeStatus.NodeStatusActive,
    banned: NodeStatus.NodeStatusBanned,
    deleted: NodeStatus.NodeStatusDeleted,
  } satisfies Record<string, NodeStatus>

  const statusColors = {
    all: 'success',
    active: 'info',
    banned: 'failure',
    deleted: 'failure',
  }

  const statusNames = {
    all: t('All'),
    active: t('Active'),
    banned: t('Banned'),
    deleted: t('Deleted'),
  }

  const allStatuses = [...Object.values(statusFlags)].sort()

  const defaultSelectedStatuses = [
    (router.query as any)?.status ?? Object.keys(statusFlags),
  ]
    .flat()
    .map((status) => statusFlags[status])
    .filter(Boolean)

  const [selectedStatuses, _setSelectedStatuses] = React.useState<NodeStatus[]>(
    defaultSelectedStatuses.length > 0
      ? defaultSelectedStatuses
      : [NodeStatus.NodeStatusActive]
  )

  const setSelectedStatuses = (statuses: NodeStatus[]) => {
    _setSelectedStatuses(statuses)

    const checkedAll =
      allStatuses.join(',').toString() ===
      [...statuses].sort().join(',').toString()
    const searchParams = checkedAll
      ? undefined
      : ({
          status: Object.entries(statusFlags)
            .filter(([status, s]) => statuses.includes(s))
            .map(([status]) => status),
        } as any)
    const search = new URLSearchParams({
      ...(omit('status')(router.query) as object),
      ...searchParams,
    })
      .toString()
      .replace(/^(?!$)/, '?')
    const hash = router.asPath.split('#')[1]
      ? `#${router.asPath.split('#')[1]}`
      : ''
    router.push(`${router.pathname}${search}${hash}`)
  }

  // Search filter
  const queryForNodeId = Array.isArray(router.query.nodeId)
    ? router.query.nodeId[0]
    : router.query.nodeId

  const getAllNodesQuery = useListAllNodes({
    page: page,
    limit: 10,
    include_banned: selectedStatuses.includes(NodeStatus.NodeStatusBanned),
  })

  const updateNodeMutation = useUpdateNode()
  const adminUpdateNodeMutation = useAdminUpdateNode()
  const banNodeMutation = useBanPublisherNode()

  React.useEffect(() => {
    if (getAllNodesQuery.isError) {
      toast.error(t('Error getting nodes'))
    }
  }, [getAllNodesQuery, t])

  // Filter nodes by status and search
  const filteredNodes = React.useMemo(() => {
    let nodes = getAllNodesQuery.data?.nodes || []

    // Filter by status
    if (
      selectedStatuses.length > 0 &&
      selectedStatuses.length < allStatuses.length
    ) {
      nodes = nodes.filter((node) =>
        selectedStatuses.includes(node.status as NodeStatus)
      )
    }

    // Filter by nodeId search
    if (queryForNodeId) {
      nodes = nodes.filter(
        (node) =>
          node.id?.toLowerCase().includes(queryForNodeId.toLowerCase()) ||
          node.name?.toLowerCase().includes(queryForNodeId.toLowerCase())
      )
    }

    return nodes
  }, [
    getAllNodesQuery.data?.nodes,
    selectedStatuses,
    queryForNodeId,
    allStatuses.length,
  ])

  const executeBanOperation = async (node: Node, action: 'ban' | 'unban') => {
    if (!node.publisher?.id || !node.id) {
      toast.error(
        t('Unable to {{action}}: missing node or publisher information', {
          action,
        })
      )
      return
    }

    setProcessingNodeId(node.id)
    try {
      if (action === 'ban') {
        await banNodeMutation.mutateAsync({
          publisherId: node.publisher.id,
          nodeId: node.id,
        })
        toast.success(t('Node banned successfully'))
      } else {
        // Use adminUpdateNodeMutation for unban to ensure proper permissions
        await adminUpdateNodeMutation.mutateAsync({
          nodeId: node.id,
          data: {
            ...node,
            status: NodeStatus.NodeStatusActive,
          },
        })
        toast.success(t('Node unbanned successfully'))
      }
      queryClient.invalidateQueries({ queryKey: ['/nodes'] })
      getAllNodesQuery.refetch()
    } catch (error: any) {
      // Check if error is due to missing JWT token
      if (error?.message === 'ADMIN_JWT_REQUIRED') {
        // Save pending operation and show modal
        setPendingBanOperation({ node, action })
        setShowJwtModal(true)
        setProcessingNodeId(null)
        return
      }
      console.error(`Error ${action}ning node:`, error)
      toast.error(t('Error {{action}}ning node', { action }))
    } finally {
      setProcessingNodeId(null)
    }
  }

  const handleBanNode = async (node: Node) => {
    if (
      !confirm(
        t('Are you sure you want to ban "{{name}}"?', { name: node.name })
      )
    ) {
      return
    }

    // Check if JWT token is valid
    if (!isAdminJwtTokenValid()) {
      setPendingBanOperation({ node, action: 'ban' })
      setShowJwtModal(true)
      return
    }

    await executeBanOperation(node, 'ban')
  }

  const handleUnbanNode = async (node: Node) => {
    if (
      !confirm(
        t('Are you sure you want to unban "{{name}}"?', { name: node.name })
      )
    ) {
      return
    }

    // Check if JWT token is valid
    if (!isAdminJwtTokenValid()) {
      setPendingBanOperation({ node, action: 'unban' })
      setShowJwtModal(true)
      return
    }

    await executeBanOperation(node, 'unban')
  }

  const handleJwtTokenGenerated = async () => {
    // Retry pending operation after token is generated
    if (pendingBanOperation) {
      await executeBanOperation(
        pendingBanOperation.node,
        pendingBanOperation.action
      )
      setPendingBanOperation(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: newPage },
      },
      undefined,
      { shallow: true }
    )
  }

  const openEditModal = (node: Node) => {
    setEditingNode(node)
    setEditFormData({
      tags: node.tags?.join(', ') || '',
      category: node.category || '',
    })
  }

  const closeEditModal = () => {
    setEditingNode(null)
    setEditFormData({ tags: '', category: '' })
  }

  const handleSave = async () => {
    if (!editingNode || !editingNode.publisher?.id) {
      toast.error(t('Unable to save: missing node or publisher information'))
      return
    }

    const updatedNode: Node = {
      ...editingNode,
      tags: editFormData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      category: editFormData.category.trim() || undefined,
    }

    try {
      await updateNodeMutation.mutateAsync({
        publisherId: editingNode.publisher.id,
        nodeId: editingNode.id!,
        data: updatedNode,
      })

      toast.success(t('Node updated successfully'))
      closeEditModal()
      queryClient.invalidateQueries({ queryKey: ['/nodes'] })
    } catch (error) {
      console.error('Error updating node:', error)
      toast.error(t('Error updating node'))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  const handleUnclaim = async () => {
    if (!unclaimingNode || !unclaimingNode.id) {
      toast.error(t('Unable to unclaim: missing node information'))
      return
    }

    try {
      await adminUpdateNodeMutation.mutateAsync({
        nodeId: unclaimingNode.id,
        data: {
          ...unclaimingNode,
          publisher: {
            id: UNCLAIMED_ADMIN_PUBLISHER_ID,
          },
        },
      })

      toast.success(t('Node successfully unclaimed'))
      setUnclaimingNode(null)
      queryClient.invalidateQueries({ queryKey: ['/nodes'] })
    } catch (error) {
      console.error('Error unclaiming node:', error)
      toast.error(t('Error unclaiming node'))
    }
  }

  if (getAllNodesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    )
  }

  const totalPages = Math.ceil((getAllNodesQuery.data?.total || 0) / 10)

  return (
    <div>
      <Breadcrumb className="py-4 px-4">
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
        <Breadcrumb.Item className="dark">{t('Manage Nodes')}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-200">
          {t('Node Management')}
        </h1>
        <div className="text-lg font-bold text-gray-200">
          {t('Total Results')}: {filteredNodes.length} /{' '}
          {getAllNodesQuery.data?.total || 0}
        </div>

        {/* Search Filter */}
        <form
          className="flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault()
            const inputElement = document.getElementById(
              'filter-node-id'
            ) as HTMLInputElement
            const nodeId = inputElement.value.trim()
            const searchParams = new URLSearchParams({
              ...(omit(['nodeId'])(router.query) as object),
              ...(nodeId ? { nodeId } : {}),
            })
              .toString()
              .replace(/^(?!$)/, '?')
            const hash = router.asPath.split('#')[1]
              ? `#${router.asPath.split('#')[1]}`
              : ''
            router.push(router.pathname + searchParams + hash)
          }}
        >
          <TextInput
            id="filter-node-id"
            placeholder={t('Search by node ID or name')}
            defaultValue={queryForNodeId || ''}
            className="flex-1 dark"
          />
          <Button color="blue">{t('Search')}</Button>
        </form>

        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          <Button
            color={
              selectedStatuses.length >= Object.keys(statusFlags).length
                ? statusColors.all
                : 'gray'
            }
            className={clsx({
              'brightness-50': !(
                selectedStatuses.length >= Object.keys(statusFlags).length
              ),
              'hover:brightness-100': !(
                selectedStatuses.length >= Object.keys(statusFlags).length
              ),
              'transition-all duration-200': true,
            })}
            onClick={() => setSelectedStatuses(Object.values(NodeStatus))}
          >
            {t('All')}
          </Button>

          {Object.entries(statusFlags).map(([status, statusValue]) => (
            <Button
              key={status}
              color={statusColors[status]}
              className={clsx({
                'brightness-50': !selectedStatuses.includes(statusValue),
                'hover:brightness-100': !selectedStatuses.includes(statusValue),
                'transition-all duration-200': true,
              })}
              onClick={() => setSelectedStatuses([statusValue])}
            >
              {statusNames[status]} {t('Nodes')}
            </Button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable className="min-w-full dark">
          <Table.Head className="dark">
            <Table.HeadCell className="dark">{t('Node')}</Table.HeadCell>
            <Table.HeadCell className="dark">{t('Publisher')}</Table.HeadCell>
            <Table.HeadCell className="dark">{t('Category')}</Table.HeadCell>
            <Table.HeadCell className="dark">{t('Tags')}</Table.HeadCell>
            <Table.HeadCell className="dark">{t('Status')}</Table.HeadCell>
            <Table.HeadCell className="dark">{t('Actions')}</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y dark">
            {filteredNodes.map((node) => (
              <Table.Row
                key={node.id}
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{node.name}</span>
                      <Link target="_blank" href={`/nodes/${node.id}`}>
                        <MdOpenInNew className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">@{node.id}</div>
                  </div>
                </Table.Cell>
                <Table.Cell className="dark">
                  {node.publisher?.name && (
                    <div>
                      <div>{node.publisher.name}</div>
                      <div className="text-sm text-gray-500">
                        {node.publisher.id}
                      </div>
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell className="dark">{node.category || '-'}</Table.Cell>
                <Table.Cell className="dark">
                  {node.tags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {node.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )}
                </Table.Cell>
                <Table.Cell className="dark">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      node.status === NodeStatus.NodeStatusActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : node.status === NodeStatus.NodeStatusBanned
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}
                  >
                    {node.status?.replace('NodeStatus', '') || 'Unknown'}
                  </span>
                </Table.Cell>
                <Table.Cell className="dark">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openEditModal(node)}
                      disabled={!node.publisher?.id}
                      title={
                        !node.publisher?.id
                          ? t('No publisher information available')
                          : t('Edit node')
                      }
                    >
                      <HiPencil className="w-4 h-4" />
                    </Button>

                    {node.status === NodeStatus.NodeStatusActive && (
                      <Button
                        size="sm"
                        color="failure"
                        onClick={() => handleBanNode(node)}
                        disabled={
                          !node.publisher?.id || processingNodeId === node.id
                        }
                        title={t('Ban this node')}
                      >
                        {processingNodeId === node.id ? (
                          <Spinner size="sm" />
                        ) : (
                          t('Ban')
                        )}
                      </Button>
                    )}

                    {node.status === NodeStatus.NodeStatusBanned && (
                      <Button
                        size="sm"
                        color="success"
                        onClick={() => handleUnbanNode(node)}
                        disabled={
                          !node.publisher?.id || processingNodeId === node.id
                        }
                        title={t('Unban this node')}
                      >
                        {processingNodeId === node.id ? (
                          <Spinner size="sm" />
                        ) : (
                          t('Unban')
                        )}
                      </Button>
                    )}

                    {node.publisher?.id && (
                      <Button
                        size="sm"
                        color="warning"
                        onClick={() => setUnclaimingNode(node)}
                        title={t('Unclaim node')}
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="py-8">
        <CustomPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        show={!!editingNode}
        onClose={closeEditModal}
        size="lg"
        className="dark"
      >
        <Modal.Header className="dark">
          {t('Edit Node')}: {editingNode?.name}
        </Modal.Header>
        <Modal.Body className="dark">
          <div className="space-y-6" onKeyDown={handleKeyDown}>
            <div>
              <Label
                htmlFor="category"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {t('Category')}
              </Label>
              <TextInput
                id="category"
                value={editFormData.category}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                placeholder={t('Enter category')}
                className="dark"
              />
            </div>
            <div>
              <Label
                htmlFor="tags"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {t('Tags (comma separated)')}
              </Label>

              {/* Predefined Tags */}
              <div className="mb-3">
                <div className="text-sm text-gray-400 mb-2">
                  {t('Quick Add Tags')}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'dev',
                    'unsafe',
                    'fragile_deps',
                    'tricky_deps',
                    'poor_desc',
                    'unmaintained',
                  ].map((tag) => {
                    const currentTags = editFormData.tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0)
                    const isSelected = currentTags.includes(tag)

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            // Remove tag
                            const newTags = currentTags.filter((t) => t !== tag)
                            setEditFormData((prev) => ({
                              ...prev,
                              tags: newTags.join(', '),
                            }))
                          } else {
                            // Add tag
                            const newTags = [...currentTags, tag]
                            setEditFormData((prev) => ({
                              ...prev,
                              tags: newTags.join(', '),
                            }))
                          }
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Manual Tag Input */}
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  {t('All Tags')} ({t('comma separated')}):
                </div>
                <TextInput
                  id="tags"
                  value={editFormData.tags}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  placeholder={t('Enter tags separated by commas')}
                  className="dark"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('Press Ctrl+Enter to save')}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="dark">
          <Button onClick={handleSave} disabled={updateNodeMutation.isPending}>
            {updateNodeMutation.isPending ? <Spinner size="sm" /> : t('Save')}
          </Button>
          <Button color="gray" onClick={closeEditModal}>
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Unclaim Confirmation Modal */}
      <Modal
        show={!!unclaimingNode}
        onClose={() => setUnclaimingNode(null)}
        size="md"
        className="dark"
      >
        <Modal.Header className="dark">
          {t('Confirm Unclaim Node')}
        </Modal.Header>
        <Modal.Body className="dark">
          <div className="space-y-4">
            <p className="text-gray-300">
              {t(
                'Are you sure you want to unclaim this node? This will remove the publisher association, allowing the original author to claim it under a different publisher.'
              )}
            </p>
            <div className="bg-gray-700 p-4 rounded">
              <div className="font-semibold text-white">
                {unclaimingNode?.name}
              </div>
              <div className="text-sm text-gray-400">@{unclaimingNode?.id}</div>
              {unclaimingNode?.publisher && (
                <div className="text-sm text-gray-400 mt-2">
                  {t('Current Publisher')}: {unclaimingNode.publisher.name} (
                  {unclaimingNode.publisher.id})
                </div>
              )}
            </div>
            <div className="text-yellow-500 text-sm">
              ⚠️ {t('This action cannot be undone automatically.')}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="dark">
          <Button
            color="warning"
            onClick={handleUnclaim}
            disabled={adminUpdateNodeMutation.isPending}
          >
            {adminUpdateNodeMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              t('Unclaim Node')
            )}
          </Button>
          <Button color="gray" onClick={() => setUnclaimingNode(null)}>
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* JWT Token Modal */}
      <AdminJwtTokenModal
        isOpen={showJwtModal}
        onClose={() => {
          setShowJwtModal(false)
          setPendingBanOperation(null)
        }}
        onTokenGenerated={handleJwtTokenGenerated}
      />
    </div>
  )
}

export default withAdmin(NodeList)
