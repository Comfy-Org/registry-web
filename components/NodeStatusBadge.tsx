import { Badge } from 'flowbite-react'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'
import { NodeVersionStatus } from '@/src/api/generated'

export function NodeStatusBadge({
  status,
  count,
}: {
  status: NodeVersionStatus
  count?: number
}) {
  return (
    <Badge
      color={
        {
          [NodeVersionStatus.NodeVersionStatusActive]: 'success',
          [NodeVersionStatus.NodeVersionStatusBanned]: 'failure',
          [NodeVersionStatus.NodeVersionStatusFlagged]: 'warning',
        }[status as NodeVersionStatus] || 'gray'
      }
      className="text-[14px]"
    >
      {NodeVersionStatusToReadable({
        status: status as NodeVersionStatus,
      })}
      {count != null ? <span> x{count}</span> : null}
    </Badge>
  )
}
