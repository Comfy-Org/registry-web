import { Button } from 'flowbite-react'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { CreateSecretKeyModal } from '../AccessTokens/CreateSecretKeyModal'
import {
    Publisher,
    useDeletePersonalAccessToken,
    useListNodesForPublisher,
    useListPersonalAccessTokens,
    useUpdatePublisher,
} from 'src/api/generated'
import EditPublisherModal from '../publisher/EditPublisherModal'
import { toast } from 'react-toastify'
import PersonalAccessTokenTable from '../AccessTokens/PersonalAccessTokenTable'

type PublisherDetailProps = {
    publisher: Publisher
}
const PublisherDetail: React.FC<PublisherDetailProps> = ({ publisher }) => {
    const router = useRouter()
    const updatePublisherMutation = useUpdatePublisher()
    const deleteTokenMutation = useDeletePersonalAccessToken()
    const {
        data: personalAccessTokens,
        error,
        isLoading: isLoadingAccessTokens,
        refetch: refetchTokens,
    } = useListPersonalAccessTokens(publisher.id as string)
    const { data: nodes } = useListNodesForPublisher(publisher.id as string)
    const [openSecretKeyModal, setOpenSecretKeyModal] = useState(false)
    const [openEditModal, setOpenEditModal] = useState(false)

    const handleCreateButtonClick = () => {
        setOpenSecretKeyModal(true)
    }

    const onCloseCreateSecretKeyModal = () => {
        setOpenSecretKeyModal(false)
    }
    const handleEditButtonClick = () => {
        setOpenEditModal(true)
    }

    const handleSubmitEditPublisher = (displayName: string) => {
        updatePublisherMutation.mutate(
            {
                publisherId: publisher?.id as string,
                data: {
                    name: displayName,
                },
            },
            {
                onError: (error) => {
                    toast.error('Failed to update publisher')
                },
                onSuccess: () => {
                    setOpenEditModal(false)
                    // force reload the page
                    router.reload()
                },
            }
        )
    }
    const onCloseEditModal = () => {
        setOpenEditModal(false)
    }

    const oneMemberOfPublisher = getFirstMemberName(publisher)

    if (error || publisher === undefined || publisher.id === undefined) {
        return <div className="container p-6 mx-auto h-[90vh]">Not Found</div>
    }

    return (
        <div className="container p-6 mx-auto h-[90vh]">
            <div className="flex items-center cursor-pointer  mb-8">
                <svg
                    className="w-4 h-4 text-gray-400 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m15 19-7-7 7-7"
                    />
                </svg>
                <span
                    className="text-gray-400 pl-1 text-base  bg-transparent border-none hover:!bg-transparent hover:!border-none focus:!bg-transparent focus:!border-none focus:!outline-none"
                    onClick={() => router.push(`/nodes`)}
                >
                    <span>Back to your nodes</span>
                </span>
            </div>

            <div>
                <div className="flex justify-between">
                    <h1 className="mb-4 text-5xl font-bold text-white">
                        {publisher.name}
                    </h1>
                    <Button
                        size="xs"
                        className="h-8 p-2 px-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                        color="blue"
                        onClick={handleEditButtonClick}
                    >
                        <svg
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                            />
                        </svg>
                        <span className="text-[10px]">Edit details</span>
                    </Button>
                </div>
                <p className="text-gray-400">@{publisher.id}</p>
                <div className="flex flex-col my-4 ">
                    <p className="flex items-center mt-1 text-xs text-center text-gray-400">
                        <svg
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a4 4 0 0 1-4 4h-1a3 3 0 0 0-3 3"
                            />
                        </svg>
                        <span className="ml-2">
                            {nodes ? `${nodes.length} nodes` : ''}
                        </span>
                    </p>
                    {oneMemberOfPublisher && (
                        <p className="flex items-center mt-1 text-xs text-center text-gray-400 align-center">
                            <svg
                                className="w-5 h-5 text-white"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke="currentColor"
                                    stroke-width="2"
                                    d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                />
                            </svg>
                            <span className="ml-2">{oneMemberOfPublisher}</span>
                        </p>
                    )}
                </div>
                <PersonalAccessTokenTable
                    handleCreateButtonClick={handleCreateButtonClick}
                    accessTokens={personalAccessTokens || []}
                    isLoading={isLoadingAccessTokens}
                    deleteToken={(tokenId: string) =>
                        deleteTokenMutation.mutate(
                            {
                                publisherId: publisher.id as string,
                                tokenId: tokenId,
                            },
                            {
                                onError: (error) => {
                                    toast.error('Failed to delete token')
                                },
                                onSuccess: () => {
                                    toast.success('Token deleted')
                                    refetchTokens()
                                },
                            }
                        )
                    }
                />
            </div>
            <CreateSecretKeyModal
                publisherId={publisher.id}
                openModal={openSecretKeyModal}
                onCloseModal={onCloseCreateSecretKeyModal}
                onCreationSuccess={refetchTokens}
            />
            <EditPublisherModal
                openModal={openEditModal}
                onCloseModal={onCloseEditModal}
                onSubmit={handleSubmitEditPublisher}
                publisher={publisher}
            />
        </div>
    )
}

export default PublisherDetail

function getFirstMemberName(publisher: Publisher): string | undefined {
    // Check if the publisher has members and the first member has a user and name
    if (publisher.members && publisher.members.length > 0) {
        const firstMember = publisher.members[0]
        if (firstMember.user && firstMember.user.name) {
            return firstMember.user.name
        }
    }
    // Return undefined if no member or no member name is found
    return undefined
}
