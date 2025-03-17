import { Spinner } from 'flowbite-react'
import React, { useState } from 'react'
import {
    Publisher,
    useListPublishersForUser,
    useUpdatePublisher,
} from 'src/api/generated'
import GenericHeader from '../common/GenericHeader'
import PublisherNodes from './PublisherNodes'

import { toast } from 'react-toastify'
import EditPublisherModal from './EditPublisherModal'

const Nodes: React.FC = () => {
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
                    toast.error('Failed to update publisher')
                },
                onSuccess: () => {
                    setSelectedPublisher(null)
                    refetch()
                    toast.success('Publisher updated successfully')
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
    console.log({data})

    return (
        <section className="h-full mt-8 bg-gray-900 lg:mt-20">
            <div>
                <GenericHeader
                    title="Your nodes"
                    subTitle="View and edit your nodes and publishers."
                    buttonText="New Publisher"
                    showIcon={true}
                    buttonLink="/publishers/create"
                />
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
