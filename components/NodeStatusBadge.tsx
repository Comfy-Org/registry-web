import { Badge } from 'flowbite-react'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'
import { NodeVersionStatus } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

export function NodeStatusBadge({
  status,
  count,
}: {
  status: NodeVersionStatus
  count?: number
}) {
  const { t } = useNextTranslation()
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
      {t(NodeVersionStatusToReadable({ status }))}
      {count != null ? <span> x{count}</span> : null}
    </Badge>
  )
}
