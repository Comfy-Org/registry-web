import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { Button, Label, Modal } from 'flowbite-react'
import { FormEventHandler, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
    Error,
    getGetNodeQueryKey,
    getSearchNodesQueryKey,
    Node,
    useGetNode,
    useUpdateNode,
} from '@/src/api/generated'
import { INVALIDATE_CACHE_OPTION, shouldInvalidate } from '@/components/cache-control'
import { useNextTranslation } from 'src/hooks/i18n'

export default function SearchRankingEditModal({
    open,
    onClose,
    nodeId,
    defaultSearchRanking,
    quickMode = true,
}: {
    quickMode?: boolean
    open: boolean
    onClose: () => void
    nodeId: string
    defaultSearchRanking: number
}) {
    const { t } = useNextTranslation()
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
                toast.success(t('Search ranking updated successfully'))
            },
            onError: (error: AxiosError<Error>) => {
                toast.error(
                    error.response?.data?.message ||
                        t('Failed to update search ranking')
                )
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
            toast.error(t('Publisher ID is required to update search ranking'))
            return null
        }
        setIsSubmitting(true)

        // optimistically update the cache
        qc.setQueryData(
            getGetNodeQueryKey(nodeId),
            (oldData: Node | undefined) =>
                oldData && { ...oldData, search_ranking: searchRanking }
        )
        qc.setQueriesData(
            {
                queryKey: getSearchNodesQueryKey().slice(0, 1),
                exact: false,
            },
            (oldData: { nodes?: Node[] } | undefined) => {
                return (
                    oldData && {
                        ...oldData,
                        nodes: oldData?.nodes?.map((n) =>
                            n.id === nodeId
                                ? { ...n, search_ranking: searchRanking }
                                : n
                        ),
                    }
                )
            }
        )
        if (quickMode) onClose()
        await updateNodeMutation
            .mutateAsync({
                nodeId,
                publisherId,
                data: { ...node, search_ranking: searchRanking },
            })
            .finally(() => {
                // Cache-busting invalidation for cached endpoints
                qc.fetchQuery(
                    shouldInvalidate.getGetNodeQueryOptions(
                        nodeId,
                        undefined,
                        INVALIDATE_CACHE_OPTION
                    )
                )
                
                // Regular invalidation for non-cached endpoints
                qc.invalidateQueries({
                    queryKey: getSearchNodesQueryKey().slice(0, 1),
                })
                setIsSubmitting(false)
                onClose()
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
                <Modal.Header>{t('Edit Search Ranking')}</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-sm text-gray-300">
                            {t(
                                'Search Ranking: integer from 1 to 10. Lower number means higher search ranking, all else equal.'
                            )}
                        </p>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="search-ranking"
                                    value={t('Search Ranking')}
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
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="blue"
                            isProcessing={isSubmitting}
                            type="submit"
                        >
                            {t('Update')}
                        </Button>
                    </div>
                </Modal.Footer>
            </form>
        </Modal>
    )
}
