import { Badge } from 'flowbite-react'
import { NodeStatus } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

const NodeStatusBadge: React.FC<{ status?: NodeStatus }> = ({ status }) => {
    const { t } = useNextTranslation()

    // TODO(robinjhuang): Add badge for active status
    if (status === NodeStatus.NodeStatusBanned) {
        return <Badge color="failure">{t('Banned')}</Badge>
    }

    return null
}

export default NodeStatusBadge
