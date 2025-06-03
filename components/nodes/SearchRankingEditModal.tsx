import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal } from 'flowbite-react'
import { FormEventHandler, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    Error,
    getGetNodeQueryKey,
    Node,
    useGetNode,
    useUpdateNode,
} from 'src/api/generated'

export default function SearchRankingEditModal({
    open,
    onClose,
    nodeId,
    defaultSearchRanking,
}: {
    open: boolean
    onClose: () => void
    nodeId: string
    defaultSearchRanking: number
}) {
    const [searchRanking, setSearchRanking] =
        useState<number>(defaultSearchRanking)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Get the node data
    const { data: node } = useGetNode(nodeId)
    const qc = useQueryClient()

    // Update node mutation
    const updateNodeMutation = useUpdateNode({
        mutation: {
            onSuccess: () => {
                toast.success('Search ranking updated successfully')
                // refresh data
                qc.invalidateQueries({
                    queryKey: getGetNodeQueryKey(nodeId),
                })
                qc.setQueryData(
                    getGetNodeQueryKey(nodeId),
                    (oldData: Node | undefined) =>
                        oldData && { ...oldData, search_ranking: searchRanking }
                )
                setIsSubmitting(false)
                onClose()
            },
            onError: (error: AxiosError<Error>) => {
                toast.error(
                    error.response?.data?.message ||
                        'Failed to update search ranking'
                )
                setIsSubmitting(false)
            },
        },
    })

    useEffect(() => {
        if (node?.search_ranking) {
            setSearchRanking(node.search_ranking)
        }
    }, [node?.search_ranking])

    const publisherId = node?.publisher?.id
    const onSubmit: FormEventHandler = async (e) => {
        e.preventDefault()
        if (!publisherId) {
            toast.error('Publisher ID is required to update search ranking')
            return null
        }
        setIsSubmitting(true)
        await updateNodeMutation.mutateAsync({
            nodeId,
            publisherId,
            data: {
                search_ranking: searchRanking,
            },
        })
    }

    return (
        <Modal
            dismissible
            show={open}
            onClose={onClose}
            theme={{
                root: {
                    base: 'fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex justify-center items-center',
                },
                content: {
                    base: 'relative h-full w-full p-4 md:h-auto',
                    inner: 'relative rounded-lg bg-gray-700 shadow dark:bg-gray-700 flex flex-col max-h-[90vh]',
                },
                header: {
                    base: 'flex items-start justify-between rounded-t p-5 dark:border-gray-600',
                    title: 'text-xl font-medium text-white dark:text-white',
                },
                body: {
                    base: 'p-6 flex-1 overflow-auto text-white',
                },
                footer: {
                    base: 'flex items-center space-x-2 rounded-b border-gray-600 p-6 dark:border-gray-600',
                },
            }}
            size="md"
        >
            <form onSubmit={onSubmit}>
                <Modal.Header>Edit Search Ranking</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-sm text-gray-300">
                            Search Ranking: integer from 1 to 10. Lower number
                            means higher search ranking, all else equal.
                        </p>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="search-ranking"
                                    value="Search Ranking"
                                    className="text-white"
                                />
                            </div>
                            <input
                                id="search-ranking"
                                type="number"
                                min={1}
                                max={10}
                                value={searchRanking}
                                onChange={(e) =>
                                    setSearchRanking(
                                        Math.max(
                                            1,
                                            Math.min(
                                                10,
                                                parseInt(e.target.value) || 1
                                            )
                                        )
                                    )
                                }
                                className={`w-full p-2.5 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg`}
                                required
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex justify-end gap-2 w-full">
                        <Button color="gray" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="blue"
                            isProcessing={isSubmitting}
                            type="submit"
                        >
                            Update
                        </Button>
                    </div>
                </Modal.Footer>
            </form>
        </Modal>
    )
}
