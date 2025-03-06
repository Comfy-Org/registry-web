import React from 'react'
import { Button, Modal } from 'flowbite-react'
import { customThemeTModal } from 'utils/comfyTheme'
import { useDeleteNodeVersion } from 'src/api/generated'
import { toast } from 'react-toastify'
import { AxiosError } from 'axios'

type NodeVersionDeleteModalProps = {
    openDeleteModal: boolean
    onCloseDeleteModal: () => void
    nodeId: string
    versionId: string
    publisherId?: string
}

export const NodeVersionDeleteModal: React.FC<NodeVersionDeleteModalProps> = ({
    openDeleteModal,
    onCloseDeleteModal,
    nodeId,
    versionId,
    publisherId,
}) => {
    const deleteVersionMutation = useDeleteNodeVersion({})

    const handleDeleteVersion = () => {
        if (!publisherId) {
            toast.error('Cannot delete version.')
            return
        }
        deleteVersionMutation.mutate(
            {
                nodeId: nodeId,
                versionId: versionId,
                publisherId: publisherId,
            },
            {
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(
                            `Failed to delete version. ${error.response?.data?.message}`
                        )
                    } else {
                        toast.error('Failed to delete version')
                    }
                },
                onSuccess: () => {
                    toast.success('Version deleted successfully')
                    onCloseDeleteModal()
                },
            }
        )
    }

    return (
        <Modal
            show={openDeleteModal}
            size="md"
            onClose={onCloseDeleteModal}
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800 px-8">
                    <p className="text-white">Delete Version</p>
                </Modal.Header>
                <div className="space-y-6">
                    <p className="text-white">
                        Are you sure you want to delete this version? This
                        action cannot be undone.
                    </p>
                    <div className="flex">
                        <Button
                            color="gray"
                            className="w-full text-white bg-gray-800"
                            onClick={onCloseDeleteModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="red"
                            className="w-full ml-5"
                            onClick={handleDeleteVersion}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}
