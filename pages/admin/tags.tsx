import { useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Modal,
  Spinner,
  Table,
  TextInput,
} from 'flowbite-react'
import { useRouter } from 'next/router'
import { omit } from 'rambda'
import React, { useState } from 'react'
import {
  HiExternalLink,
  HiHome,
  HiOutlineCollection,
  HiPencil,
  HiTag,
} from 'react-icons/hi'
import { toast } from 'react-toastify'
import AdminTreeNavigation from '@/components/admin/AdminTreeNavigation'
import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { usePage } from '@/components/hooks/usePage'
import { Node, useAdminUpdateNode, useListAllNodes } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

export default withAdmin(TagsPage)
function TagsPage() {
  const { t } = useNextTranslation()
  const router = useRouter()
  const [page, setPage] = usePage()
  const [limit] = useState<number>(20)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [editFormData, setEditFormData] = useState({
    tags: '',
    tags_admin: '',
  })
  const queryClient = useQueryClient()
  const adminUpdateNodeMutation = useAdminUpdateNode()

  // Search filter
  const queryForNodeId = Array.isArray(router.query.nodeId)
    ? router.query.nodeId[0]
    : router.query.nodeId

  const { data: nodesData } = useListAllNodes({
    page: page || 1,
    limit: limit,
    sort: ['name'],
  })

  const totalPages = Math.ceil((nodesData?.total || 0) / limit)

  // Filter nodes by nodeId search
  const nodes = React.useMemo(() => {
    let filteredNodes = nodesData?.nodes || []

    if (queryForNodeId) {
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.id?.toLowerCase().includes(queryForNodeId.toLowerCase()) ||
          node.name?.toLowerCase().includes(queryForNodeId.toLowerCase())
      )
    }

    return filteredNodes
  }, [nodesData?.nodes, queryForNodeId])

  const openEditModal = (node: Node) => {
    setEditingNode(node)
    setEditFormData({
      tags: node.tags?.join(', ') || '',
      tags_admin: node.tags_admin?.join(', ') || '',
    })
  }

  const closeEditModal = () => {
    setEditingNode(null)
    setEditFormData({ tags: '', tags_admin: '' })
  }

  const handleSave = async () => {
    if (!editingNode) {
      toast.error(t('Unable to save: missing node information'))
      return
    }

    const newTags = editFormData.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    const newAdminTags = editFormData.tags_admin
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const originalTags = editingNode.tags || []
    const originalAdminTags = editingNode.tags_admin || []

    // Check if regular tags changed
    const tagsChanged =
      JSON.stringify([...originalTags].sort()) !==
      JSON.stringify([...newTags].sort())

    // Check if admin tags changed
    const adminTagsChanged =
      JSON.stringify([...originalAdminTags].sort()) !==
      JSON.stringify([...newAdminTags].sort())

    // Check if anything changed
    if (!tagsChanged && !adminTagsChanged) {
      toast.info(t('No changes detected'))
      closeEditModal()
      return
    }

    try {
      // Always use admin endpoint on admin page
      const updatedNode: Node = {
        ...editingNode,
        tags: newTags,
        tags_admin: newAdminTags,
      }

      await adminUpdateNodeMutation.mutateAsync({
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

  return (
    <div className="p-4">
      <Breadcrumb className="py-4">
        <Breadcrumb.Item href="/" icon={HiHome} className="dark">
          {t('Home')}
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/admin" className="dark">
          {t('Admin Dashboard')}
        </Breadcrumb.Item>
        <Breadcrumb.Item className="dark">
          {t('Tag Management')}
        </Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-gray-200 mb-6">
        {t('Tag Management')}
      </h1>

      {/* Search Filter */}
      <form
        className="flex gap-2 items-center mb-6"
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
              <Badge
                color="info"
                icon={HiOutlineCollection}
                className="text-white"
              >
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
                    <Table.HeadCell className="bg-gray-700 text-gray-200">
                      {t('Admin Tags')}
                    </Table.HeadCell>
                    <Table.HeadCell className="bg-gray-700 text-gray-200">
                      {t('Actions')}
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
                            <div>
                              <div>{node.name}</div>
                              <div className="text-sm text-gray-500">
                                @{node.id}
                              </div>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-2">
                            {node.tags && node.tags.length > 0 ? (
                              node.tags.map((tag, index) => (
                                <Badge
                                  key={`${tag}-${index}`}
                                  color="purple"
                                  icon={HiTag}
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">
                                {t('No tags')}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex flex-wrap gap-2">
                            {node.tags_admin && node.tags_admin.length > 0 ? (
                              node.tags_admin.map((tag, index) => (
                                <Badge
                                  key={`${tag}-${index}`}
                                  color="warning"
                                  icon={HiTag}
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400 text-sm">
                                {t('No admin tags')}
                              </span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => openEditModal(node)}
                              title={t('Edit tags')}
                            >
                              <HiPencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              color="gray"
                              onClick={() =>
                                window.open(`/nodes/${node.id}`, '_blank')
                              }
                              title={t('Open node details in new window')}
                            >
                              <HiExternalLink className="w-4 h-4" />
                            </Button>
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
                <p className="text-gray-400">{t('No nodes found')}</p>
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

      {/* Edit Modal */}
      <Modal
        show={!!editingNode}
        onClose={closeEditModal}
        size="lg"
        className="dark"
      >
        <Modal.Header className="dark">
          {t('Edit Tags')}: {editingNode?.name}
        </Modal.Header>
        <Modal.Body className="dark">
          <div className="space-y-6" onKeyDown={handleKeyDown}>
            <div>
              <Label
                htmlFor="tags"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {t('Tags (comma separated)')}
              </Label>
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
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t(
                  'Public tags visible to all users (e.g., video, audio, utility)'
                )}
              </p>
            </div>
            <div>
              <Label
                htmlFor="tags_admin"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {t('Admin Tags (comma separated)')}
              </Label>
              <TextInput
                id="tags_admin"
                value={editFormData.tags_admin}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    tags_admin: e.target.value,
                  }))
                }
                placeholder={t('Enter admin tags separated by commas')}
                className="dark"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {t(
                  'Admin-only tags for security warnings and metadata (e.g., dev, unsafe, fragile_deps)'
                )}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('Press Ctrl+Enter to save')}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="dark">
          <Button
            onClick={handleSave}
            disabled={adminUpdateNodeMutation.isPending}
          >
            {adminUpdateNodeMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              t('Save')
            )}
          </Button>
          <Button color="gray" onClick={closeEditModal}>
            {t('Cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
