import { Badge } from 'flowbite-react'
import { NodeVersionStatus } from '@/src/api/generated'
import { NodeVersionStatusToReadable } from 'src/mapper/nodeversion'
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
            {NodeVersionStatusToReadable({
                status: status as NodeVersionStatus,
            })}
            {count != null && <span>{t(`×{{count}}`, { count })}</span>}
        </Badge>
    )
}
