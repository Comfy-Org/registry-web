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
} from 'src/api/generated'
import { useNextTranslation } from 'src/hooks/i18n'

export default function PreemptedComfyNodeNamesEditModal({
    open,
    onClose,
    nodeId,
    defaultPreemptedComfyNodeNames,
    quickMode = true,
}: {
    quickMode?: boolean
    open: boolean
    onClose: () => void
    nodeId: string
    defaultPreemptedComfyNodeNames: string[]
}) {
    const { t } = useNextTranslation()
    const [preemptedComfyNodeNames, setPreemptedComfyNodeNames] = useState<
        string[]
    >(defaultPreemptedComfyNodeNames || [])
    const [newName, setNewName] = useState<string>('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Get the node data
    const { data: node } = useGetNode(nodeId)
    const qc = useQueryClient()

    // Update node mutation
    const updateNodeMutation = useUpdateNode({
        mutation: {
            onSuccess: () => {
                toast.success(
                    t('Preempted comfy node names updated successfully')
                )
            },
            onError: (error: AxiosError<Error>) => {
                toast.error(
                    error.response?.data?.message ||
                        t('Failed to update preempted comfy node names')
                )
            },
        },
    })

    useEffect(() => {
        if (node?.preempted_comfy_node_names) {
            setPreemptedComfyNodeNames(node.preempted_comfy_node_names)
        }
    }, [node?.preempted_comfy_node_names])

    const publisherId = node?.publisher?.id
    const onSubmit: FormEventHandler = async (e) => {
        e.preventDefault()
        if (!publisherId) {
            toast.error(
                t(
                    'Publisher ID is required to update preempted comfy node names'
                )
            )
            return null
        }
        setIsSubmitting(true)

        // optimistically update the cache
        qc.setQueryData(
            getGetNodeQueryKey(nodeId),
            (oldData: Node | undefined) =>
                oldData && {
                    ...oldData,
                    preempted_comfy_node_names: preemptedComfyNodeNames,
                }
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
                                ? {
                                      ...n,
                                      preempted_comfy_node_names:
                                          preemptedComfyNodeNames,
                                  }
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
                data: {
                    ...node,
                    preempted_comfy_node_names: preemptedComfyNodeNames,
                },
            })
            .finally(() => {
                // Invalidate queries to ensure fresh data
                qc.invalidateQueries({
                    queryKey: getGetNodeQueryKey(nodeId),
                })
                qc.invalidateQueries({
                    queryKey: getSearchNodesQueryKey().slice(0, 1),
                })
                setIsSubmitting(false)
                onClose()
            })
    }

    const handleAddName = () => {
        if (!newName.trim()) return

        // Check if name already exists in the list
        if (preemptedComfyNodeNames.includes(newName.trim())) {
            toast.info(t('This name is already in the list'))
            return
        }

        setPreemptedComfyNodeNames([...preemptedComfyNodeNames, newName.trim()])
        setNewName('')
    }

    const handleRemoveName = (index: number) => {
        const updatedNames = [...preemptedComfyNodeNames]
        updatedNames.splice(index, 1)
        setPreemptedComfyNodeNames(updatedNames)
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
                <Modal.Header>
                    {t('Edit Preempted Comfy Node Names')}
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-sm text-gray-300">
                            {t(
                                'Preempted Comfy Node Names: List of names that should be treated as the same comfy-node. This helps maintain consistent search results across differently named nodes.'
                            )}
                        </p>
                        <div>
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="preempted-comfy-node-names"
                                    value={t(
                                        'Current Preempted Comfy Node Names'
                                    )}
                                    className="text-white"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {preemptedComfyNodeNames.length === 0 ? (
                                    <p className="text-gray-400">
                                        {t(
                                            'No preempted comfy node names added yet'
                                        )}
                                    </p>
                                ) : (
                                    preemptedComfyNodeNames.map(
                                        (name, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center bg-gray-600 px-3 py-1 rounded-full"
                                            >
                                                <span className="mr-2">
                                                    {name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveName(index)
                                                    }
                                                    className="text-gray-300 hover:text-white"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    id="new-name"
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder={t('Add new name')}
                                    className="flex-grow p-2.5 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                                />
                                <Button
                                    type="button"
                                    color="blue"
                                    onClick={handleAddName}
                                >
                                    {t('Add')}
                                </Button>
                            </div>
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
