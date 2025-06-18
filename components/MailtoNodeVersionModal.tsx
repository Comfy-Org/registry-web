import {
    NodeVersion,
    Publisher,
    useGetNode,
    useGetPublisher,
} from '@/src/api/generated'
import { Button, Modal, Spinner } from 'flowbite-react'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'

export default function MailtoNodeVersionModal({
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
    const { data: node, isLoading: isNodeLoading } = useGetNode(
        nv?.node_id ?? '',
        {},
        { query: { enabled: !!nv } }
    )
    const { data: publisher, isLoading: publisherLoading } = useGetPublisher(
        node?.id ?? '',
        { query: { enabled: !!node?.id } }
    )

    const newIssueLink = !node?.repository
        ? 'javascript:'
        : `${node.repository}/issues/new?title=${encodeURIComponent(`Issue with Node Version ${nv?.node_id}@${nv?.version}`)}&body=${encodeURIComponent(`Node Version: ${nv?.node_id}@${nv?.version}\n\nPlease describe the issue or request you have regarding this node version.`)}`

    if (!nv) return null

    return (
        <Modal show={open} onClose={onClose} dismissible>
            <Modal.Header>
                Contact Publisher: {publisher?.name || publisher?.id}
            </Modal.Header>
            <Modal.Body>
                <div className="space-y-4">
                    <ol className="list-decimal pl-5 space-y-2">
                        {!!node?.repository && (
                            <li>
                                <p className="text-gray-500 dark:text-gray-400">
                                    You can contact the publisher via GitHub:
                                </p>
                                <Link
                                    href={newIssueLink}
                                    className="text-blue-600 hover:underline space-x-2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    legacyBehavior>
                                    <FaGithub className="inline mr-2" />
                                    Open Issue on GitHub
                                    {isNodeLoading && (
                                        <Spinner className="w-4 h-4" />
                                    )}
                                </Link>
                            </li>
                        )}
                        {publisher?.members?.length && (
                            <li>
                                <p className="text-gray-500 dark:text-gray-400">
                                    You can contact the publisher via email:
                                </p>
                                <ListPublisherEmails {...{ publisher }} />
                                {publisherLoading && (
                                    <Spinner className="w-4 h-4" />
                                )}
                            </li>
                        )}
                    </ol>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
function ListPublisherEmails({ publisher }: { publisher: Publisher }) {
    return (
        <ul className="list-disc pl-5 space-y-2">
            {publisher?.members
                ?.map((member) => member.user?.email)
                // type-safe filter to remove empty emails
                ?.flatMap((e) => (e ? [e] : []))
                .map((email) => (
                    <li key={email}>
                        <Link
                            href={`mailto:${email}`}
                            className="text-blue-600 hover:underline"
                            legacyBehavior>
                            {email}
                        </Link>
                    </li>
                ))}
        </ul>
    );
}
