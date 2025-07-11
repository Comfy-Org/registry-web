import { CustomPagination } from '@/components/common/CustomPagination'
import withAdmin from '@/components/common/HOC/authAdmin'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useQueryClient } from '@tanstack/react-query'
import {
    Breadcrumb,
    Button,
    Modal,
    Spinner,
    Table,
    TextInput,
    Label,
    Textarea,
    Select,
    Badge,
} from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { HiHome, HiPencil, HiSearch } from 'react-icons/hi'
import { toast } from 'react-toastify'
import {
    useListAllComfyNodes,
    useUpdateComfyNode,
    ComfyNode,
    ComfyNodeUpdateRequest,
    ComfyNodePolicy,
} from '@/src/api/generated'
import { useForm, Controller } from 'react-hook-form'

interface ComfyNodeEditModalProps {
    isOpen: boolean
    onClose: () => void
    comfyNode: ComfyNode | null
    nodeId: string
    version: string
    onSuccess?: () => void
}

interface FormData {
    category: string
    description: string
    function: string
    input_types: string
    return_names: string
    return_types: string
    output_is_list: string
    deprecated: boolean
    experimental: boolean
    policy: ComfyNodePolicy
}

function ComfyNodeEditModal({
    isOpen,
    onClose,
    comfyNode,
    nodeId,
    version,
    onSuccess,
}: ComfyNodeEditModalProps) {
    const { t } = useNextTranslation()
    const updateComfyNode = useUpdateComfyNode()

    const {
        control,
        handleSubmit,
        reset,
        formState: { isDirty },
    } = useForm<FormData>({
        defaultValues: {
            category: comfyNode?.category || '',
            description: comfyNode?.description || '',
            function: comfyNode?.function || '',
            input_types: comfyNode?.input_types || '',
            return_names: comfyNode?.return_names || '',
            return_types: comfyNode?.return_types || '',
            output_is_list: comfyNode?.output_is_list?.join(', ') || '',
            deprecated: comfyNode?.deprecated || false,
            experimental: comfyNode?.experimental || false,
            policy: comfyNode?.policy || ComfyNodePolicy.ComfyNodePolicyActive,
        },
    })

    const onSubmit = async (data: FormData) => {
        if (!comfyNode?.comfy_node_name) return

        try {
            const updateData: ComfyNodeUpdateRequest = {
                category: data.category,
                description: data.description,
                function: data.function,
                input_types: data.input_types,
                return_names: data.return_names,
                return_types: data.return_types,
                output_is_list: data.output_is_list
                    ? data.output_is_list
                        .split(',')
                        .map((s) => s.trim() === 'true')
                    : undefined,
                deprecated: data.deprecated,
                experimental: data.experimental,
                policy: data.policy,
            }

            await updateComfyNode.mutateAsync({
                nodeId,
                version,
                comfyNodeName: comfyNode.comfy_node_name,
                data: updateData,
            })

            toast.success(t('ComfyNode updated successfully'))
            onClose()
            onSuccess?.()
        } catch (error) {
            console.error('Error updating ComfyNode:', error)
            toast.error(t('Failed to update ComfyNode'))
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!comfyNode) return null

    return (
        <Modal show={isOpen} onClose={handleClose} size="4xl" className="dark">
            <Modal.Header>
                {t('Edit ComfyNode: {{name}}', {
                    name: comfyNode.comfy_node_name,
                })}
            </Modal.Header>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Modal.Body>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="category">
                                    {t('Category')}
                                </Label>
                                <Controller
                                    name="category"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            id="category"
                                            {...field}
                                            placeholder={t('Enter category')}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Label htmlFor="function">
                                    {t('Function')}
                                </Label>
                                <Controller
                                    name="function"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            id="function"
                                            {...field}
                                            placeholder={t(
                                                'Enter function name'
                                            )}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">
                                {t('Description')}
                            </Label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        id="description"
                                        rows={3}
                                        {...field}
                                        placeholder={t('Enter description')}
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="input_types">
                                    {t('Input Types')}
                                </Label>
                                <Controller
                                    name="input_types"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            id="input_types"
                                            rows={3}
                                            {...field}
                                            placeholder={t('Enter input types')}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Label htmlFor="return_types">
                                    {t('Return Types')}
                                </Label>
                                <Controller
                                    name="return_types"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            id="return_types"
                                            rows={3}
                                            {...field}
                                            placeholder={t(
                                                'Enter return types'
                                            )}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="return_names">
                                    {t('Return Names')}
                                </Label>
                                <Controller
                                    name="return_names"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            id="return_names"
                                            {...field}
                                            placeholder={t(
                                                'Enter return names'
                                            )}
                                        />
                                    )}
                                />
                            </div>
                            <div>
                                <Label htmlFor="output_is_list">
                                    {t('Output Is List')}
                                </Label>
                                <Controller
                                    name="output_is_list"
                                    control={control}
                                    render={({ field }) => (
                                        <TextInput
                                            id="output_is_list"
                                            {...field}
                                            placeholder={t(
                                                'Enter comma-separated boolean values'
                                            )}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="policy">{t('Policy')}</Label>
                                <Controller
                                    name="policy"
                                    control={control}
                                    render={({ field }) => (
                                        <Select id="policy" {...field}>
                                            <option
                                                value={
                                                    ComfyNodePolicy.ComfyNodePolicyActive
                                                }
                                            >
                                                {t('Active')}
                                            </option>
                                            <option
                                                value={
                                                    ComfyNodePolicy.ComfyNodePolicyBanned
                                                }
                                            >
                                                {t('Banned')}
                                            </option>
                                            <option
                                                value={
                                                    ComfyNodePolicy.ComfyNodePolicyLocalOnly
                                                }
                                            >
                                                {t('Local Only')}
                                            </option>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Controller
                                        name="deprecated"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="checkbox"
                                                id="deprecated"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="rounded"
                                            />
                                        )}
                                    />
                                    <Label htmlFor="deprecated">
                                        {t('Deprecated')}
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Controller
                                        name="experimental"
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                type="checkbox"
                                                id="experimental"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="rounded"
                                            />
                                        )}
                                    />
                                    <Label htmlFor="experimental">
                                        {t('Experimental')}
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        color="gray"
                        onClick={handleClose}
                        disabled={updateComfyNode.isPending}
                        type="button"
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        color="blue"
                        type="submit"
                        disabled={updateComfyNode.isPending || !isDirty}
                        isProcessing={updateComfyNode.isPending}
                    >
                        {updateComfyNode.isPending
                            ? t('Saving...')
                            : t('Save Changes')}
                    </Button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}

function ComfyNodesManage() {
    const { t } = useNextTranslation()
    const router = useRouter()
    const queryClient = useQueryClient()
    const [page, setPage] = useState<number>(1)
    const [selectedComfyNode, setSelectedComfyNode] =
        useState<ComfyNode | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [nodeIdFilter, setNodeIdFilter] = useState('')
    const [versionFilter, setVersionFilter] = useState('')
    const [comfyNodeNameFilter, setComfyNodeNameFilter] = useState('')
    const [searchNodeId, setSearchNodeId] = useState('')
    const [searchVersion, setSearchVersion] = useState('')
    const [searchComfyNodeName, setSearchComfyNodeName] = useState('')

    const pageSize = 12

    const { data, isLoading, refetch } = useListAllComfyNodes({
        node_id: searchNodeId || undefined,
        node_version: searchVersion || undefined,
        comfy_node_name: searchComfyNodeName || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!nodeIdFilter && !versionFilter && !comfyNodeNameFilter) {
            toast.error(t('Please enter at least one search criterion'))
            return
        }
        setSearchNodeId(nodeIdFilter)
        setSearchVersion(versionFilter)
        setSearchComfyNodeName(comfyNodeNameFilter)
        setPage(1)
    }

    const handleEdit = (comfyNode: ComfyNode) => {
        setSelectedComfyNode(comfyNode)
        setIsEditModalOpen(true)
    }

    const handleEditSuccess = () => {
        refetch()
        queryClient.invalidateQueries({
            queryKey: ['/comfy-nodes'],
        })
    }

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    const getPolicyBadgeColor = (policy: ComfyNodePolicy) => {
        switch (policy) {
            case ComfyNodePolicy.ComfyNodePolicyActive:
                return 'success'
            case ComfyNodePolicy.ComfyNodePolicyBanned:
                return 'failure'
            case ComfyNodePolicy.ComfyNodePolicyLocalOnly:
                return 'warning'
            default:
                return 'gray'
        }
    }

    const getPolicyLabel = (policy: ComfyNodePolicy) => {
        switch (policy) {
            case ComfyNodePolicy.ComfyNodePolicyActive:
                return t('Active')
            case ComfyNodePolicy.ComfyNodePolicyBanned:
                return t('Banned')
            case ComfyNodePolicy.ComfyNodePolicyLocalOnly:
                return t('Local Only')
            default:
                return t('Unknown')
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
                    {t('Manage ComfyNodes')}
                </Breadcrumb.Item>
            </Breadcrumb>

            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                {t('Manage ComfyNodes')}
            </h1>

            <form
                onSubmit={handleSearch}
                className="flex gap-2 items-center mb-6"
            >
                <TextInput
                    placeholder={t('Node ID (optional)')}
                    value={nodeIdFilter}
                    onChange={(e) => setNodeIdFilter(e.target.value)}
                />
                <TextInput
                    placeholder={t('Version (optional)')}
                    value={versionFilter}
                    onChange={(e) => setVersionFilter(e.target.value)}
                />
                <TextInput
                    placeholder={t('ComfyNode Name (optional)')}
                    value={comfyNodeNameFilter}
                    onChange={(e) => setComfyNodeNameFilter(e.target.value)}
                />
                <Button type="submit" color="blue">
                    <HiSearch className="mr-2" />
                    {t('Search')}
                </Button>
            </form>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Spinner size="lg" />
                </div>
            ) : data?.comfy_nodes ? (
                <>
                    <div className="mb-4 text-sm text-gray-400">
                        {t(
                            'Found {{total}} ComfyNodes (showing {{count}} on this page)',
                            {
                                total: data.total || 0,
                                count: data.comfy_nodes.length,
                            }
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <Table.Head>
                                <Table.HeadCell>{t('Name')}</Table.HeadCell>
                                <Table.HeadCell>{t('Category')}</Table.HeadCell>
                                <Table.HeadCell>{t('Function')}</Table.HeadCell>
                                <Table.HeadCell>
                                    {t('Description')}
                                </Table.HeadCell>
                                <Table.HeadCell>{t('Policy')}</Table.HeadCell>
                                <Table.HeadCell>{t('Flags')}</Table.HeadCell>
                                <Table.HeadCell>{t('Actions')}</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className="divide-y">
                                {data.comfy_nodes.map((comfyNode) => (
                                    <Table.Row
                                        key={comfyNode.comfy_node_name}
                                        className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            {comfyNode.comfy_node_name}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {comfyNode.category}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {comfyNode.function}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="max-w-xs truncate">
                                                {comfyNode.description}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge
                                                color={getPolicyBadgeColor(
                                                    comfyNode.policy!
                                                )}
                                                size="sm"
                                            >
                                                {getPolicyLabel(
                                                    comfyNode.policy!
                                                )}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-1">
                                                {comfyNode.deprecated && (
                                                    <Badge
                                                        color="warning"
                                                        size="sm"
                                                    >
                                                        {t('Deprecated')}
                                                    </Badge>
                                                )}
                                                {comfyNode.experimental && (
                                                    <Badge
                                                        color="info"
                                                        size="sm"
                                                    >
                                                        {t('Experimental')}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Button
                                                size="sm"
                                                color="blue"
                                                onClick={() =>
                                                    handleEdit(comfyNode)
                                                }
                                            >
                                                <HiPencil className="mr-1" />
                                                {t('Edit')}
                                            </Button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    </div>

                    {data.total && data.total > pageSize && (
                        <div className="mt-6">
                            <CustomPagination
                                currentPage={page}
                                totalPages={Math.ceil(data.total / pageSize)}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </>
            ) : searchNodeId || searchVersion || searchComfyNodeName ? (
                <div className="text-center text-gray-400 py-8">
                    {t('No ComfyNodes found for the specified criteria')}
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    {t('Enter search criteria to find ComfyNodes')}
                </div>
            )}

            <ComfyNodeEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                comfyNode={selectedComfyNode}
                nodeId={searchNodeId || ''}
                version={searchVersion || ''}
                onSuccess={handleEditSuccess}
            />
        </div>
    )
}

export default withAdmin(ComfyNodesManage)
