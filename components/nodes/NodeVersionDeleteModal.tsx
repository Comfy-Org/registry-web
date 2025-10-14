import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Modal } from 'flowbite-react'
import React from 'react'
import { toast } from 'react-toastify'
import { customThemeTModal } from 'utils/comfyTheme'
import { useDeleteNodeVersion } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import { INVALIDATE_CACHE_OPTION, shouldInvalidate } from '../cache-control'

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
    const { t } = useNextTranslation()
    const deleteVersionMutation = useDeleteNodeVersion({})
    const qc = useQueryClient()
    const handleDeleteVersion = () => {
        if (!publisherId) {
            toast.error(t('Cannot delete version.'))
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
                            t('Failed to delete version: {{message}}', {
                                message: error.response?.data?.message,
                            })
                        )
                    } else {
                        toast.error(t('Failed to delete version'))
                    }
                },
                onSuccess: () => {
                    toast.success(t('Version deleted successfully'))
                    qc.fetchQuery(
                        shouldInvalidate.getListNodeVersionsQueryOptions(
                            nodeId,
                            undefined,
                            INVALIDATE_CACHE_OPTION
                        )
                    )
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
            theme={customThemeTModal as Modal['props']['theme']}
            dismissible
        >
            <Modal.Body className="!bg-gray-800 p-8 md:px-9 md:py-8 rounded-none">
                <Modal.Header className="!bg-gray-800 px-8">
                    <p className="text-white">Delete Version</p>
                </Modal.Header>
                <div className="space-y-6">
                    <p className="text-white">
                        {t(
                            'Are you sure you want to delete this version? This action cannot be undone.'
                        )}
                    </p>
                    <div className="flex">
                        <Button
                            color="gray"
                            className="w-full text-white bg-gray-800"
                            onClick={onCloseDeleteModal}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="red"
                            className="w-full ml-5"
                            onClick={handleDeleteVersion}
                        >
                            {t('Delete')}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}
