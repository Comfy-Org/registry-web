import React, { Suspense } from 'react'
import {
    useListAllNodeVersions,
    useAdminUpdateNodeVersion,
    AdminUpdateNodeVersionBody,
    NodeVersion,
    NodeVersionStatus,
} from 'src/api/generated'
import {
    Button,
    Table,
    TextInput,
    Label,
    Spinner,
    Breadcrumb,
    Textarea,
    Select,
    Dropdown,
} from 'flowbite-react'
import { toast } from 'react-toastify'
import withAdmin from '@/components/common/HOC/authAdmin'
import { useNextTranslation } from '@/src/hooks/i18n'
import router from 'next/router'
import { HiHome } from 'react-icons/hi'

// This page allows admins to update node version compatibility fields
export default withAdmin(NodeVersionCompatibilityAdmin)

function NodeVersionCompatibilityAdmin() {
    const { t } = useNextTranslation()
    const [nodeId, setNodeId] = React.useState<string | undefined>(undefined)
    const [statuses, setStatuses] = React.useState<NodeVersionStatus[]>([])

    return (
        <main className="p-4 dark">
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

            <div className="mb-4">
                <Label htmlFor="nodeId" className="mr-2">
                    {t('Filter by Node ID')}
                </Label>
                <TextInput
                    id="nodeId"
                    value={nodeId || ''}
                    onChange={(e) => setNodeId(e.target.value)}
                    placeholder={t('Enter Node ID to filter')}
                    className="inline-block w-64"
                />
                <Label htmlFor="statuses" className="ml-4 mr-2">
                    {t('Filter by Statuses')}
                </Label>
                <Dropdown
                    label={t('Select Statuses')}
                    className="inline-block w-64"
                    // onChange={(value) => {
                    //   const selectedStatuses = value
                    //     ? (value as NodeVersionStatus[]).filter(
                    //         (status) => status !== 'all'
                    //       )
                    //     : []
                    //   setStatuses(selectedStatuses)
                    // }}
                    value={statuses.length > 0 ? statuses : undefined}
                >
                    {Object.values(NodeVersionStatus).map((status) => (
                        <Dropdown.Item key={status} value={status}>
                            <Label>{t(status)}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown>
            </div>
            <Table>
                <Table.Head>
                    <Table.HeadCell>{t('Node')}</Table.HeadCell>
                    <Table.HeadCell>{t('Version')}</Table.HeadCell>
                    <Table.HeadCell>{t('ComfyUI Frontend')}</Table.HeadCell>
                    <Table.HeadCell>{t('ComfyUI')}</Table.HeadCell>
                    <Table.HeadCell>{t('OS')}</Table.HeadCell>
                    <Table.HeadCell>{t('Accelerators')}</Table.HeadCell>
                    <Table.HeadCell>{t('Actions')}</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                    <Suspense fallback={<Spinner />}>
                        <DataTable
                            nodeId={nodeId ?? undefined}
                            statuses={statuses}
                        />
                    </Suspense>
                </Table.Body>
            </Table>
        </main>
    )

    function DataTable({
        nodeId,
        statuses,
    }: {
        nodeId?: string
        statuses?: NodeVersionStatus[]
    }) {
        const { t } = useNextTranslation()
        const [editingId, setEditingId] = React.useState<string | null>(null)
        const [editValues, setEditValues] =
            React.useState<AdminUpdateNodeVersionBody>({})
        const { data, isLoading, isError } = useListAllNodeVersions({
            page: 1,
            pageSize: 24,
            statuses,
            nodeId,
        })
        const adminUpdateNodeVersion = useAdminUpdateNodeVersion()

        if (isLoading) return <Spinner />
        if (isError) return <div>{t('Error loading node versions')}</div>

        const handleEdit = (nv: NodeVersion) => {
            setEditingId(nv.id || DIEToast(t('Node Version ID is required')))
            setEditValues({
                supported_comfyui_frontend_version:
                    nv.supported_comfyui_frontend_version || '',
                supported_comfyui_version: nv.supported_comfyui_version || '',
                supported_os: nv.supported_os || [],
                supported_accelerators: nv.supported_accelerators || [],
            })
        }

        const handleSave = async (nv: NodeVersion) => {
            try {
                await adminUpdateNodeVersion.mutateAsync({
                    nodeId: nv.node_id || DIEToast(t('Node ID is required')),
                    versionNumber:
                        nv.version ||
                        DIEToast(t('Node Version Number is required')),
                    data: {
                        supported_comfyui_frontend_version:
                            editValues.supported_comfyui_frontend_version,
                        supported_comfyui_version:
                            editValues.supported_comfyui_version,
                        supported_os: editValues.supported_os,
                        supported_accelerators:
                            editValues.supported_accelerators,
                    },
                })
                toast.success(t('Updated node version compatibility'))
                setEditingId(null)
            } catch (e) {
                toast.error(t('Failed to update node version'))
            }
        }

        return (
            <>
                {data?.versions?.map((nv) => (
                    <Table.Row key={nv.id}>
                        <Table.Cell>{nv.node_id}</Table.Cell>
                        <Table.Cell>{nv.version}</Table.Cell>
                        <Table.Cell>
                            {editingId === nv.id ? (
                                <TextInput
                                    value={
                                        editValues.supported_comfyui_frontend_version
                                    }
                                    onChange={(e) =>
                                        setEditValues((v) => ({
                                            ...v,
                                            supported_comfyui_frontend_version:
                                                e.target.value,
                                        }))
                                    }
                                />
                            ) : (
                                nv.supported_comfyui_frontend_version || ''
                            )}
                        </Table.Cell>
                        <Table.Cell>
                            {editingId === nv.id ? (
                                <TextInput
                                    value={editValues.supported_comfyui_version}
                                    onChange={(e) =>
                                        setEditValues((v) => ({
                                            ...v,
                                            supported_comfyui_version:
                                                e.target.value,
                                        }))
                                    }
                                />
                            ) : (
                                nv.supported_comfyui_version || ''
                            )}
                        </Table.Cell>
                        <Table.Cell>
                            {editingId === nv.id ? (
                                <Textarea
                                    value={editValues.supported_os?.join('\n')}
                                    onChange={(e) =>
                                        setEditValues((v) => ({
                                            ...v,
                                            supported_os: e.target.value
                                                .split('\n')
                                                .map((e) => e.trim())
                                                .filter(Boolean),
                                        }))
                                    }
                                />
                            ) : (
                                <code className="whitespace-pre">
                                    {nv.supported_os?.join('\n') || ''}
                                </code>
                            )}
                        </Table.Cell>
                        <Table.Cell>
                            {editingId === nv.id ? (
                                <Textarea
                                    value={editValues.supported_accelerators?.join(
                                        '\n'
                                    )}
                                    onChange={(e) =>
                                        setEditValues((v) => ({
                                            ...v,
                                            supported_accelerators:
                                                e.target.value
                                                    .split('\n')
                                                    .map((e) => e.trim())
                                                    .filter(Boolean),
                                        }))
                                    }
                                />
                            ) : (
                                <code className="whitespace-pre">
                                    {nv.supported_accelerators || ''}
                                </code>
                            )}
                        </Table.Cell>
                        <Table.Cell>
                            {editingId === nv.id ? (
                                <>
                                    <Button
                                        size="xs"
                                        onClick={() => handleSave(nv)}
                                        color="success"
                                    >
                                        {t('Save')}
                                    </Button>
                                    <Button
                                        size="xs"
                                        onClick={() => setEditingId(null)}
                                        color="gray"
                                    >
                                        {t('Cancel')}
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size="xs"
                                    onClick={() => handleEdit(nv)}
                                    color="primary"
                                >
                                    {t('Edit')}
                                </Button>
                            )}
                        </Table.Cell>
                    </Table.Row>
                ))}
            </>
        )
    }
}

function DIEToast(message: string): never {
    toast.error(message)
    throw new Error(message)
}
