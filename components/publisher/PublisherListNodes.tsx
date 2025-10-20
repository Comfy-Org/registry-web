import { Spinner } from 'flowbite-react'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import {
    Publisher,
    useListPublishersForUser,
    useUpdatePublisher,
} from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import GenericHeader from '../common/GenericHeader'
import EditPublisherModal from './EditPublisherModal'
import PublisherNodes from './PublisherNodes'

const Nodes: React.FC = () => {
    const { t } = useNextTranslation()
    const { data, isLoading, isError, refetch } = useListPublishersForUser()
    const updatePublisherMutation = useUpdatePublisher()
    const [selectedPublisher, setSelectedPublisher] =
        useState<Publisher | null>(null)

    const onCloseEditPublisherModal = () => {
        setSelectedPublisher(null)
    }
    const handleEditPublisherClick = (publisher: Publisher) => {
        return () => setSelectedPublisher(publisher)
    }

    const handleSubmitEditPublisher = (displayName: string) => {
        updatePublisherMutation.mutate(
            {
                publisherId: selectedPublisher?.id as string,
                data: {
                    name: displayName,
                },
            },
            {
                onError: (error) => {
                    toast.error(t('Failed to update publisher'))
                },
                onSuccess: () => {
                    setSelectedPublisher(null)
                    refetch()
                    toast.success(t('Publisher updated successfully'))
                },
            }
        )
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="" />
            </div>
        )
    }

    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <div>
                <GenericHeader
                    title={t('Your nodes')}
                    subTitle={t('View and edit your nodes and publishers.')}
                    buttonText={t('New Publisher')}
                    showIcon={true}
                    buttonLink="/publishers/create"
                />
            </div>

            {/* Publish instruction banner */}
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg mt-4">
                <p className="text-blue-200 text-sm">
                    {t(
                        'Wanna publish your first node? Check publish tutorial here:'
                    )}{' '}
                    <a
                        href="https://docs.comfy.org/registry/publishing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                    >
                        {t('Publishing Nodes - ComfyUI')}
                    </a>
                </p>
            </div>

            {data?.map((publisher, index) => (
                <PublisherNodes
                    key={index}
                    publisher={publisher}
                    onEditPublisher={handleEditPublisherClick(publisher)}
                />
            ))}

            {selectedPublisher && (
                <EditPublisherModal
                    openModal={!!selectedPublisher}
                    onCloseModal={onCloseEditPublisherModal}
                    onSubmit={handleSubmitEditPublisher}
                    publisher={selectedPublisher}
                />
            )}
        </section>
    )
}

export default Nodes
