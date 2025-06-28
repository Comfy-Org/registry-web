/**
 * PublisherSpan Component
 *
 * Displays a publisher name and ID with hover information and click navigation
 */
import { Tooltip } from 'flowbite-react'
import { useRouter } from 'next/router'
import { MouseEvent } from 'react'

interface PublisherSpanProps {
    publisherId: string
    publisherName?: string
    className?: string
    onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

export default function PublisherSpan({
    publisherId,
    publisherName,
    className = '',
    onClick,
}: PublisherSpanProps) {
    const router = useRouter()

    const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
        if (onClick) {
            onClick(e)
            return
        }

        e.preventDefault()
        window.open(`/publishers/${publisherId}`, '_blank')
    }

    return (
        <div className="inline-block">
            <Tooltip
                content={`View publisher details for ${publisherName || publisherId}`}
                placement="top"
                style="light"
            >
                <span
                    className={`cursor-pointer underline underline-offset-2 decoration-dashed ${className}`}
                    onClick={handleClick}
                >
                    {publisherName
                        ? `${publisherName} (@${publisherId})`
                        : `@${publisherId}`}
                </span>
            </Tooltip>
        </div>
    )
}
