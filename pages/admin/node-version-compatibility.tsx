import React from 'react'
import { useRouter } from 'next/router'
import { useListAllNodeVersions, useAdminUpdateNodeVersion, NodeVersion } from 'src/api/generated'
import { Button, Table, TextInput, Label, Spinner, Alert } from 'flowbite-react'
import { toast } from 'react-toastify'
import withAdmin from '@/components/common/HOC/authAdmin'

// Extended interface for compatibility fields (not yet supported by API)
interface NodeVersionWithCompatibility extends NodeVersion {
  supported_comfyui_frontend_version?: string
  supported_comfyui_version?: string
  supported_os?: string
  supported_accelerators?: string
}

// This page allows admins to update node version compatibility fields
function NodeVersionCompatibilityAdmin() {
  const router = useRouter()
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValues, setEditValues] = React.useState<{
    supported_comfyui_frontend_version: string
    supported_comfyui_version: string
    supported_os: string
    supported_accelerators: string
  }>({
    supported_comfyui_frontend_version: '',
    supported_comfyui_version: '',
    supported_os: '',
    supported_accelerators: '',
  })
  const { data, isLoading, isError } = useListAllNodeVersions({ page: 1, pageSize: 20 })
  const updateNodeVersion = useAdminUpdateNodeVersion()

  if (isLoading) return <Spinner />
  if (isError) return <div>Error loading node versions</div>

  const handleEdit = (nv: NodeVersionWithCompatibility) => {
    setEditingId(nv.id || '')
    setEditValues({
      supported_comfyui_frontend_version: nv.supported_comfyui_frontend_version || '',
      supported_comfyui_version: nv.supported_comfyui_version || '',
      supported_os: nv.supported_os || '',
      supported_accelerators: nv.supported_accelerators || '',
    })
  }

  const handleSave = async (nv: NodeVersionWithCompatibility) => {
    // Note: The current API only supports updating status and status_reason
    // This is a placeholder implementation for future API support
    toast.error('Compatibility field updates are not yet supported by the API. This feature is under development.')
    
    // TODO: When API supports compatibility fields, uncomment and modify:
    /*
    try {
      await updateNodeVersion.mutateAsync({
        nodeId: nv.node_id!.toString(),
        versionNumber: nv.version!.toString(),
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
    */
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Node Version Compatibility Admin</h1>
      
      <Alert color="warning" className="mb-4">
        <span className="font-medium">Feature in Development:</span> This page is ready for managing node version compatibility, but the backend API doesn't yet support updating compatibility fields. The interface is prepared for when the API is updated.
      </Alert>
      
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
          {data?.versions?.map((nv: NodeVersionWithCompatibility) => (
            <Table.Row key={nv.id}>
              <Table.Cell>{nv.node_id}</Table.Cell>
              <Table.Cell>{nv.version}</Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_comfyui_frontend_version}
                    onChange={e => setEditValues(v => ({ ...v, supported_comfyui_frontend_version: e.target.value }))}
                    placeholder="e.g., <0.0.4"
                  />
                ) : (
                  (nv as NodeVersionWithCompatibility).supported_comfyui_frontend_version || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_comfyui_version}
                    onChange={e => setEditValues(v => ({ ...v, supported_comfyui_version: e.target.value }))}
                    placeholder="e.g., >=1.0.0"
                  />
                ) : (
                  (nv as NodeVersionWithCompatibility).supported_comfyui_version || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_os}
                    onChange={e => setEditValues(v => ({ ...v, supported_os: e.target.value }))}
                    placeholder="e.g., windows,linux,macos"
                  />
                ) : (
                  (nv as NodeVersionWithCompatibility).supported_os || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <TextInput
                    value={editValues.supported_accelerators}
                    onChange={e => setEditValues(v => ({ ...v, supported_accelerators: e.target.value }))}
                    placeholder="e.g., cuda,cpu,mps"
                  />
                ) : (
                  (nv as NodeVersionWithCompatibility).supported_accelerators || '-'
                )}
              </Table.Cell>
              <Table.Cell>
                {editingId === nv.id ? (
                  <>
                    <Button size="xs" onClick={() => handleSave(nv)} color="success" className="mr-2">Save</Button>
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

export default withAdmin(NodeVersionCompatibilityAdmin)
