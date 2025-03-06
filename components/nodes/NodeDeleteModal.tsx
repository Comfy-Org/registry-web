import { AxiosError } from 'axios'
import { Button, Modal } from 'flowbite-react'
import React from 'react'
import { toast } from 'react-toastify'
import { useDeleteNode } from 'src/api/generated'
import { customThemeTModal } from 'utils/comfyTheme'

type NodeDeleteModalProps = {
    openDeleteModal: boolean
    onClose: () => void
    nodeId: string
    publisherId?: string
}

export const NodeDeleteModal: React.FC<NodeDeleteModalProps> = ({
    openDeleteModal,
    onClose,
    nodeId,
    publisherId,
}) => {
    const mutation = useDeleteNode({})

    const handleDeleteVersion = () => {
        if (!publisherId) {
            toast.error('Cannot delete node.')
            return
        }
        mutation.mutate(
            {
                nodeId: nodeId,
                publisherId: publisherId,
            },
            {
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(
                            `Failed to delete node. ${error.response?.data?.message}`
                        )
                    } else {
                        toast.error('Failed to delete node')
                    }
                },
                onSuccess: () => {
                    toast.success('Version deleted successfully')
                    onClose()
                },
            }
        )
    }

    return (
        <Modal
            show={openDeleteModal}
            size="md"
            onClose={onClose}
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800 px-8">
                    <p className="text-white">Delete Node</p>
                </Modal.Header>
                <div className="space-y-6">
                    <p className="text-white">
                        Are you sure you want to delete this node? This action
                        cannot be undone.
                    </p>
                    <div className="flex">
                        <Button
                            color="gray"
                            className="w-full text-white bg-gray-800"
                            onClick={onClose}
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
