import React from 'react'
import { useRouter } from 'next/router'
import { useListAllNodeVersions, useAdminUpdateNodeVersion } from 'src/api/generated'
import { Button, Table, TextInput, Label, Spinner } from 'flowbite-react'
import { toast } from 'react-toastify'

// This page allows admins to update node version compatibility fields
export default function NodeVersionCompatibilityAdmin() {
  const router = useRouter()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValues, setEditValues] = React.useState<any>({})
  const { data, isLoading, isError } = useListAllNodeVersions({ page: 1, pageSize: 20 })
  const adminUpdateNodeVersion = useAdminUpdateNodeVersion()

  if (isLoading) return <Spinner />
  if (isError) return <div>Error loading node versions</div>

  const handleEdit = (nv: any) => {
    setEditingId(nv.id)
    setEditValues({
      supported_comfyui_frontend_version: nv.supported_comfyui_frontend_version || '',
      supported_comfyui_version: nv.supported_comfyui_version || '',
      supported_os: nv.supported_os || '',
      supported_accelerators: nv.supported_accelerators || '',
    })
  }

  const handleSave = async (nv: any) => {
    try {
      await adminUpdateNodeVersion.mutateAsync({ 
        nodeId: nv.node_id.toString(),
        versionNumber: nv.version.toString(),
        data: {
          supported_comfyui_frontend_version: editValues.supported_comfyui_frontend_version,
          supported_comfyui_version: editValues.supported_comfyui_version,
          supported_os: editValues.supported_os,
          supported_accelerators: editValues.supported_accelerators,
        },
      })
      toast.success('Updated node version compatibility')
      setEditingId(null)
    } catch (e) {
      toast.error('Failed to update node version')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Node Version Compatibility Admin</h1>
      <Table>
        <Table.Head>
          <Table.HeadCell>Node</Table.HeadCell>
          <Table.HeadCell>Version</Table.HeadCell>
          <Table.HeadCell>ComfyUI Frontend</Table.HeadCell>
          <Table.HeadCell>ComfyUI</Table.HeadCell>
          <Table.HeadCell>OS</Table.HeadCell>
          <Table.HeadCell>Accelerators</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {data?.versions?.map((nv: any) => (
            <Table.Row key={nv.id}>
              <Table.Cell>{nv.node_id}</Table.Cell>
              <Table.Cell>{nv.version}</Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_comfyui_frontend_version}
                    onChange={e => setEditValues(v => ({ ...v, supported_comfyui_frontend_version: e.target.value }))}
                  />
                ) : (
                  nv.supported_comfyui_frontend_version || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_comfyui_version}
                    onChange={e => setEditValues(v => ({ ...v, supported_comfyui_version: e.target.value }))}
                  />
                ) : (
                  nv.supported_comfyui_version || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_os}
                    onChange={e => setEditValues(v => ({ ...v, supported_os: e.target.value }))}
                  />
                ) : (
                  nv.supported_os || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_accelerators}
                    onChange={e => setEditValues(v => ({ ...v, supported_accelerators: e.target.value }))}
                  />
                ) : (
                  nv.supported_accelerators || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <>
                    <Button size="xs" onClick={() => handleSave(nv)} color="success">Save</Button>
                    <Button size="xs" onClick={() => setEditingId(null)} color="gray">Cancel</Button>
                  </>
                ) : (
                  <Button size="xs" onClick={() => handleEdit(nv)} color="primary">Edit</Button>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}
