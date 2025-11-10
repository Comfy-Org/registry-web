/**
 * NodeSpan Component
 *
 * Displays a node name and ID with hover information and click navigation
 */
import { Tooltip } from 'flowbite-react'
import { useRouter } from 'next/router'
import { MouseEvent } from 'react'

interface NodeSpanProps {
  nodeId: string
  nodeName?: string
  className?: string
  onClick?: (e: MouseEvent<HTMLSpanElement>) => void
}

export default function NodeSpan({
  nodeId,
  nodeName,
  className = '',
  onClick,
}: NodeSpanProps) {
  const router = useRouter()

  const handleClick = (e: MouseEvent<HTMLSpanElement>) => {
    if (onClick) {
      onClick(e)
      return
    }

    e.preventDefault()
    window.open(`/nodes/${nodeId}`, '_blank')
  }

  return (
    <div className="inline-block">
      <Tooltip
        content={`View node details for ${nodeName || nodeId}`}
        placement="top"
        style="light"
      >
        <span
          className={`cursor-pointer underline underline-offset-2 decoration-dashed ${className}`}
          onClick={handleClick}
        >
          {nodeName ? `${nodeName} (@${nodeId})` : `@${nodeId}`}
        </span>
      </Tooltip>
    </div>
  )
}
