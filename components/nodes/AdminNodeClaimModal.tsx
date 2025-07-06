import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Label, Modal, Spinner, TextInput } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HiExternalLink, HiOutlineCheck, HiOutlineSearch } from 'react-icons/hi'
import { toast } from 'react-toastify'
import {
    Node,
    Publisher,
    useListPublishers,
    useUpdateNode,
    getGetNodeQueryKey,
    getListNodesForPublisherV2QueryKey,
    getSearchNodesQueryKey,
} from 'src/api/generated'
import { customThemeTModal } from 'utils/comfyTheme'
import { PublisherId } from '../Search/PublisherId'

interface NodeClaimModalProps {
    isOpen: boolean
    onClose: () => void
    node: Node
    onSuccess?: () => void
}

export function AdminNodeClaimModal({
    isOpen,
    onClose,
    node,
    onSuccess,
}: NodeClaimModalProps) {
    const { t } = useNextTranslation()
    const queryClient = useQueryClient()
    const [selectedPublisher, setSelectedPublisher] =
        useState<Publisher | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationResult, setVerificationResult] = useState<{
        publisherId?: string
        error?: string
        message?: string
        verified?: boolean
    } | null>(null)

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedPublisher(null)
            setSearchTerm('')
            setIsVerifying(false)
            setVerificationResult(null)
        }
    }, [isOpen])

    // Fetch publishers list
    const { data: allPublishers, isLoading: isLoadingPublishers } =
        useListPublishers()

    // Filter publishers based on search term
    const filteredPublishers =
        allPublishers?.filter(
            (publisher) =>
                publisher.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                publisher.id?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

    // Setup mutation for updating node
    const updateNodeMutation = useUpdateNode({
        mutation: {
            onSuccess: () => {
                toast.success(
                    t(
                        'Node {{name}} successfully claimed by {{publisherName}}',
                        {
                            name: node.name,
                            publisherName: selectedPublisher?.name,
                        }
                    )
                )
                // Invalidate and refetch related queries to update the cache with cache-busting
                queryClient.invalidateQueries({
                    queryKey: getGetNodeQueryKey(node.id!),
                })

                // Invalidate unclaimed nodes list (UNCLAIMED_ADMIN_PUBLISHER_ID)
                queryClient.invalidateQueries({
                    queryKey: getListNodesForPublisherV2QueryKey(
                        UNCLAIMED_ADMIN_PUBLISHER_ID
                    ),
                    refetchType: 'all',
                })

                // Invalidate the new publisher's nodes list
                if (selectedPublisher?.id) {
                    queryClient.invalidateQueries({
                        queryKey: getListNodesForPublisherV2QueryKey(
                            selectedPublisher.id
                        ),
                        refetchType: 'all',
                    })
                }

                // Invalidate search results which might include this node
                queryClient.invalidateQueries({
                    queryKey: getSearchNodesQueryKey().slice(0, 1),
                    refetchType: 'all',
                })

                onSuccess?.()
                onClose()
            },
            onError: (error) => {
                toast.error(
                    t('Failed to update node: {{error}}', {
                        error:
                            String(error?.message || error) ||
                            t('Unknown error'),
                    })
                )
            },
        },
    })

    // Verify repository to check publisher ID
    const verifyRepository = async () => {
        if (!selectedPublisher) {
            toast.error(t('Please select a publisher first'))
            return
        }
        if (!node.repository) {
            toast.error(t('No repository URL available for this node'))
            return
        }

        setIsVerifying(true)
        setVerificationResult(null)

        try {
            // Extract GitHub owner/repo from repository URL
            const repoUrl = node.repository
            const match = repoUrl.match(
                /https:\/\/github\.com\/([^/]+)\/([^/]+)/
            )

            if (!match) {
                setVerificationResult({
                    error: t('Invalid repository URL format'),
                })
                return
            }

            const [, owner, repo] = match
            if (!owner || !repo) {
                setVerificationResult({
                    error: t('Could not extract owner and repo from URL'),
                })
                return
            }

            // Try to fetch pyproject.toml
            const file = 'pyproject.toml'

            // Use object to store results that we'll get from the loop
            const result = {
                publisherId: null as string | null,
                fileContent: null as string | null,
                foundFile: null as string | null,
            }

            try {
                const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`
                const response = await fetch(fileUrl)

                if (response.ok) {
                    result.fileContent = await response.text()
                    result.foundFile = file
                } else {
                    toast.error(
                        `Failed to fetch ${file}: ${response.status} ${response.statusText}`
                    )
                    return
                }
            } catch (error) {
                toast.error(
                    `Error fetching ${file}: ${error instanceof Error ? error.message : String(error)}`
                )
                return
            }

            if (!result.fileContent) {
                setVerificationResult({
                    error: t('Could not find pyproject configuration files'),
                })
                return
            }

            // Simple parsing to find publisher ID
            // This is a basic implementation - YAML/TOML parsing would be more robust
            const publisherIdMatches = [
                ...result.fileContent.matchAll(
                    /publisher_?id\s*[=:]\s*["']?([^"'\s]+)["']?/gi
                ),
            ]
            if (publisherIdMatches.length === 0) {
                setVerificationResult({
                    error: t('Could not find publisher ID in pyproject.toml'),
                })
                return
            }
            if (publisherIdMatches.length > 1) {
                setVerificationResult({
                    error: `Found multiple publisher IDs in pyproject.toml: ${publisherIdMatches.map((m) => m[1]).join(', ')}`,
                })
                return
            }
            const publisherIdMatch = publisherIdMatches[0]
            result.publisherId = publisherIdMatch[1]

            const matchesSelected = result.publisherId === selectedPublisher.id

            setVerificationResult({
                publisherId: result.publisherId,
                message: matchesSelected
                    ? `✅ Publisher ID in repository matches selected publisher @${result.publisherId}`
                    : `❌ Found publisher ID in repository pyproject.toml: @${result.publisherId}, but it does not match the selected publisher @${selectedPublisher?.id}`,
                error: matchesSelected
                    ? undefined
                    : t(
                          'Publisher ID in repository does not match selected publisher'
                      ),
                verified: !!matchesSelected,
            })
        } catch (error) {
            setVerificationResult({
                error: `Failed to verify repository: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            })
        } finally {
            setIsVerifying(false)
        }
    }

    // Handle claiming the node
    const handleClaimNode = async () => {
        if (!selectedPublisher?.id) {
            toast.error(t('Please select a publisher'))
            return
        }
        if (node.publisher?.id !== UNCLAIMED_ADMIN_PUBLISHER_ID) {
            toast.error(`Node ${node.id} is not Unclaimed`)
            return
        }
        try {
            await updateNodeMutation.mutateAsync({
                nodeId: node.id!,
                publisherId: UNCLAIMED_ADMIN_PUBLISHER_ID,
                data: { publisher: selectedPublisher },
            })
        } catch (error) {
            // Error is handled in the mutation's onError
            toast.error(
                t('An unexpected error occurred while claiming the node.')
            )
        }
    }

    return (
        <Modal
            show={isOpen}
            onClose={onClose}
            size="md"
            popup
            //@ts-ignore
            theme={customThemeTModal}
            dismissible
        >
            <Modal.Header className="!bg-gray-800">
                <div className="text-white">{t('Edit unclaimed node')}</div>
            </Modal.Header>
            <Modal.Body className="!bg-gray-800 p-2 md:px-4 rounded-none">
                <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">
                                {t('Node')}: {node.name}
                            </div>
                            <div className="text-sm text-gray-400">
                                {t('ID')}: {node.id}
                            </div>
                        </div>
                        <a
                            href={`/nodes/${node.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline flex items-center"
                        >
                            {t('View')} <HiExternalLink className="ml-1" />
                        </a>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="mb-4">
                        <Label htmlFor="publisher" className="text-white mb-2">
                            {t('Select Publisher')}:
                        </Label>
                        <div className="relative">
                            <TextInput
                                id="publisher-search"
                                placeholder={t('Search publishers...')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none">
                                <HiOutlineSearch className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 max-h-60 overflow-y-auto bg-gray-700 rounded-lg">
                        {isLoadingPublishers ? (
                            <div className="flex justify-center p-4">
                                <Spinner size="md" />
                            </div>
                        ) : filteredPublishers.length === 0 ? (
                            <div className="p-4 text-gray-300 text-center">
                                {t('No publishers found')}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-600">
                                {filteredPublishers.map((publisher) => (
                                    <li
                                        key={publisher.id}
                                        className={`p-3 hover:bg-gray-600 cursor-pointer ${
                                            selectedPublisher?.id ===
                                            publisher.id
                                                ? 'bg-blue-900'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedPublisher(publisher)
                                        }
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-white font-medium">
                                                    {publisher.name}
                                                </div>
                                                <div className="text-sm text-gray-400">
                                                    {publisher.id}
                                                </div>
                                            </div>
                                            {selectedPublisher?.id ===
                                                publisher.id && (
                                                <HiOutlineCheck className="h-5 w-5 text-green-400" />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {selectedPublisher && (
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <div className="text-white font-medium mb-2">
                                {t('Selected Publisher')}:
                            </div>
                            <div className="text-gray-300">
                                <div>{selectedPublisher.name}</div>
                                <div className="text-sm">
                                    <PublisherId
                                        publisherId={selectedPublisher.id}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {node.repository && (
                        <div className="p-4 bg-gray-700 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-white font-medium">
                                    {t('Repository')}:
                                </div>
                                <a
                                    href={node.repository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline flex items-center"
                                >
                                    {t('View')}{' '}
                                    <HiExternalLink className="ml-1" />
                                </a>
                            </div>
                            <div className="text-gray-300 text-sm mb-2 break-all">
                                {node.repository}
                            </div>
                            <Button
                                size="sm"
                                onClick={verifyRepository}
                                disabled={isVerifying || !selectedPublisher}
                            >
                                {isVerifying ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" />
                                        {t('Verifying...')}
                                    </>
                                ) : (
                                    t('Verify Publisher ID')
                                )}
                            </Button>

                            {verificationResult && (
                                <div
                                    className={`mt-2 p-2 rounded text-sm ${
                                        verificationResult.error
                                            ? 'bg-red-900 bg-opacity-50 text-red-200'
                                            : 'bg-green-900 bg-opacity-50 text-green-200'
                                    }`}
                                >
                                    {verificationResult.message ||
                                        verificationResult.error}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-2 bg-yellow-900 bg-opacity-50 text-yellow-200 rounded text-sm mb-2">
                        <strong>{t('Note')}:</strong>{' '}
                        {t(
                            'Claiming a node requires backend API support for updating publisherId via updateNode(...). This feature is a work in progress (WIP) and may not function until the backend is updated.'
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button color="gray" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        <Button
                            color="blue"
                            onClick={handleClaimNode}
                            disabled={
                                !selectedPublisher ||
                                updateNodeMutation.isPending ||
                                isVerifying ||
                                !verificationResult?.verified
                            }
                        >
                            {updateNodeMutation.isPending ? (
                                <>
                                    <Spinner size="sm" className="mr-2" />
                                    {t('Claiming... (WIP)')}
                                </>
                            ) : (
                                t('Claim Node (WIP)')
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    )
}
