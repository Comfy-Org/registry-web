import withAuth from '@/components/common/HOC/withAuth'
import { Button, Spinner } from 'flowbite-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { toast } from 'react-toastify'
import analytic from 'src/analytic/analytic'
import { useGetNode, useListPublishersForUser } from 'src/api/generated'
import { UNCLAIMED_ADMIN_PUBLISHER_ID } from 'src/constants'
import CreatePublisherModal from '@/components/publisher/CreatePublisherModal'
import Link from 'next/link'

export default withAuth(ClaimNodePage)

function ClaimNodePage() {
    const router = useRouter()
    const { nodeId } = router.query
    const [selectedPublisherId, setSelectedPublisherId] = useState<
        string | null
    >(null)
    const [openCreatePublisherModal, setOpenCreatePublisherModal] =
        useState(false)

    // Get the node details
    const { data: node, isLoading: nodeLoading } = useGetNode(nodeId as string)

    // Get user's publishers
    const {
        data: publishers,
        isLoading: publishersLoading,
        refetch: refetchPublishers,
    } = useListPublishersForUser()

    const isLoading = nodeLoading || publishersLoading

    // Check if node is unclaimed
    const isUnclaimed = node?.publisher?.id === UNCLAIMED_ADMIN_PUBLISHER_ID

    const handleSelectPublisher = (publisherId: string) => {
        setSelectedPublisherId(publisherId)
    }

    const handleProceedClaim = () => {
        if (!selectedPublisherId) {
            toast.error('Please select a publisher to claim this node')
            return
        }

        analytic.track('Node Claim Initiated', {
            nodeId: nodeId,
            publisherId: selectedPublisherId,
        })

        // Redirect to the GitHub OAuth page
        router.push(
            `/publishers/${selectedPublisherId}/claim-my-node?nodeId=${nodeId}`
        )
    }

    const handleOpenCreatePublisherModal = () => {
        setOpenCreatePublisherModal(true)
    }

    const handleCloseCreatePublisherModal = () => {
        setOpenCreatePublisherModal(false)
    }

    const handleCreatePublisherSuccess = async () => {
        handleCloseCreatePublisherModal()
        await refetchPublishers()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Head>
                    <title>Loading Publisher Selection | Comfy Registry</title>
                </Head>
                <Spinner size="xl" />
            </div>
        )
    }

    if (!isUnclaimed) {
        return (
            <div className="container p-6 mx-auto h-[90vh] text-white">
                <Head>
                    <title>Already Claimed | Comfy Registry</title>
                    <meta
                        name="description"
                        content="This node is already claimed by a publisher."
                    />
                </Head>
                <div className="bg-red-800 p-4 rounded-lg">
                    <h2 className="text-xl font-bold">
                        This node is already claimed
                    </h2>
                    <p className="mt-2">
                        This node is already owned by a publisher and cannot be
                        claimed.
                    </p>
                    <Button
                        color="light"
                        className="mt-4"
                        onClick={() => router.push(`/nodes/${nodeId}`)}
                    >
                        Back to Node Details
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container p-6 mx-auto h-[90vh]">
            <Head>
                <title>
                    {node?.name
                        ? `Select Publisher for ${node.name}`
                        : 'Select Publisher'}{' '}
                    | Comfy Registry
                </title>
                <meta
                    name="description"
                    content="Choose which publisher account to use when claiming this node."
                />
            </Head>

            <div className="flex items-center cursor-pointer mb-8">
                <svg
                    className="w-4 h-4 text-gray-400"
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
                    className="text-gray-400 pl-1 text-base bg-transparent border-none hover:!bg-transparent hover:!border-none focus:!bg-transparent focus:!border-none focus:!outline-none"
                    onClick={() => router.push(`/nodes/${nodeId}`)}
                >
                    <span>Back to node details</span>
                </span>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-white">
                Claim Node: {node?.name}
            </h1>

            <div className="bg-gray-800 p-6 rounded-lg mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                    Select a Publisher
                </h2>
                <p className="text-gray-300 mb-6">
                    Choose which publisher account you want to use to claim this
                    node. You must be the owner of the GitHub repository
                    {node?.repository ? (
                        <>
                            {' '}
                            at{' '}
                            <Link
                                href={node.repository}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                {node.repository}
                            </Link>
                        </>
                    ) : (
                        ' to claim this node.'
                    )}
                </p>

                {publishers && publishers.length > 0 ? (
                    <div className="space-y-4">
                        {publishers.map((publisher) => (
                            <div
                                key={publisher.id}
                                className={`p-4 rounded-lg cursor-pointer border ${
                                    selectedPublisherId === publisher.id
                                        ? 'border-blue-500 bg-gray-700'
                                        : 'border-gray-600 hover:bg-gray-700'
                                }`}
                                onClick={() =>
                                    handleSelectPublisher(
                                        publisher.id as string
                                    )
                                }
                            >
                                <h3 className="text-lg font-medium text-white">
                                    {publisher.name}
                                </h3>
                                <p className="text-gray-400">@{publisher.id}</p>
                            </div>
                        ))}

                        <div className="mt-6 flex justify-end">
                            <Button
                                color="blue"
                                onClick={handleProceedClaim}
                                disabled={!selectedPublisherId}
                            >
                                Continue to GitHub Verification
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <p className="text-white mb-4">
                            You don&#39;t have any publishers yet. Create a
                            publisher first to claim nodes.
                        </p>{' '}
                        <Button
                            color="blue"
                            onClick={handleOpenCreatePublisherModal}
                        >
                            Create Publisher
                        </Button>
                    </div>
                )}
            </div>

            {/* CreatePublisherModal */}
            <CreatePublisherModal
                openModal={openCreatePublisherModal}
                onCloseModal={handleCloseCreatePublisherModal}
                onSuccess={handleCreatePublisherSuccess}
            />
        </div>
    )
}
