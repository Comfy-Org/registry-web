import { NodeVersion, useGetNode, useGetPublisher } from '@/src/api/generated'
import { Button, Modal, Spinner } from 'flowbite-react'
import { FaGithub } from 'react-icons/fa'

export function MailtoNodeVersionModal({
    nodeVersion: nv,
    open,
    onClose,
}: {
    nodeVersion?: NodeVersion
    open: boolean
    onClose: () => void
}) {
    // 1. repo+"/issues/new" for github issues
    // 2. mailto:email for email
    const { data: node, isLoading: nodeLoading } = useGetNode(
        nv?.id ?? '',
        {},
        { query: { enabled: !!nv?.id } }
    )
    const { data: publisher, isLoading: publisherLoading } = useGetPublisher(
        node?.id ?? '',
        {
            query: { enabled: !!node?.id },
        }
    )

    const newIssueLink = !node?.repository
        ? 'javascript:'
        : `${node?.repository}/issues/new?title=${encodeURIComponent(`Issue with Node Version ${nv?.node_id}@${nv?.version}`)}&body=${encodeURIComponent(`Node Version: ${nv?.node_id}@${nv?.version}\n\nPlease describe the issue or request you have regarding this node version.`)}`
    if (!nv) return null
    return (
        <Modal show={open && !!publisher?.members} onClose={onClose} >
            <Modal.Header>
                Contact Publisher: {publisher?.name || publisher?.id}
            </Modal.Header>
            <Modal.Body>
                <div className="space-y-4">
                    <p className="text-gray-500 dark:text-gray-400">
                        1. You can contact the publisher via GitHub:
                    </p>
                    <a
                        href={newIssueLink ?? 'javascript:'}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub className="inline mr-2" />
                        {nodeLoading && <Spinner className="w-4 h-4" />}
                        Open Issue on GitHub
                    </a>

                    <p className="text-gray-500 dark:text-gray-400">
                        2. You can contact the publisher via email:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        {publisher?.members?.map((member) => (
                            <li key={member.user?.email}>
                                <a
                                    href={`mailto:${member.user?.email}`}
                                    className="text-blue-600 hover:underline"
                                >
                                    {member.user?.email}
                                </a>
                            </li>
                        ))}
                    </ul>
                    {publisherLoading && <Spinner className="w-4 h-4" />}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    )
}
