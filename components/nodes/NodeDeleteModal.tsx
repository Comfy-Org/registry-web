import { useNextTranslation } from '@/src/hooks/i18n'
import { AxiosError } from 'axios'
import { Button, Label, Modal, TextInput } from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useDeleteNode } from '@/src/api/generated'
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
    const { t } = useNextTranslation()
    const mutation = useDeleteNode({})
    const router = useRouter()
    const handleSubmit = async () => {
        if (!publisherId) {
            toast.error(t('Cannot delete node.'))
            return
        }
        return mutation.mutate(
            {
                nodeId: nodeId,
                publisherId: publisherId,
            },
            {
                onError: (error) => {
                    if (error instanceof AxiosError) {
                        toast.error(
                            t(`Failed to delete node. {{message}}`, {
                                message: error.response?.data?.message,
                            })
                        )
                    } else {
                        toast.error(t('Failed to delete node'))
                    }
                },
                onSuccess: () => {
                    toast.success(t('Node deleted successfully'))
                    onClose()
                    router.push('/nodes')
                },
            }
        )
    }

    const validateText = `${publisherId}/${nodeId}`
    const [confirmationText, setConfirmationText] = useState('')
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
                <Modal.Header className="!bg-gray-800">
                    <p className="text-white">{t('Delete Node')}</p>
                </Modal.Header>
                <form
                    className="space-y-6 p-2"
                    onSubmit={async (e) => {
                        e.preventDefault()
                        await handleSubmit()
                    }}
                >
                    <p className="text-white">
                        {t(
                            'Are you sure you want to delete this node? This action cannot be undone.'
                        )}
                    </p>
                    <div>
                        <Label className="text-white">
                            {t('Type')}{' '}
                            <code className="text-red-300 inline">
                                {validateText}
                            </code>{' '}
                            {t('to confirm')}:
                        </Label>
                        <TextInput
                            className="input"
                            name="confirmation"
                            onChange={(e) =>
                                setConfirmationText(e.target.value)
                            }
                        />
                    </div>
                    <div className="flex">
                        <Button
                            color="gray"
                            className="w-full text-white bg-gray-800"
                            onClick={onClose}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="red"
                            className="w-full ml-5"
                            type="submit"
                            disabled={validateText !== confirmationText}
                        >
                            {t('Delete')}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
        </Modal>
    )
}
