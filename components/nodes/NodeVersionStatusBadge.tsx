import { Badge } from 'flowbite-react';
import { NodeVersionStatus } from 'src/api/generated';

const statusMap: Record<NodeVersionStatus, { color: string; label: string }> = {
    [NodeVersionStatus.NodeVersionStatusActive]: {
        color: 'success',
        label: 'Live',
    },
    [NodeVersionStatus.NodeVersionStatusPending]: {
        color: 'warning',
        label: 'Pending Security Review',
    },
    [NodeVersionStatus.NodeVersionStatusFlagged]: {
        color: 'warning',
        label: 'Pending Security Review',
    },
    [NodeVersionStatus.NodeVersionStatusBanned]: {
        color: 'failure',
        label: 'Rejected',
    },
    [NodeVersionStatus.NodeVersionStatusDeleted]: {
        color: 'failure',
        label: 'Deleted',
    },
}
const NodeVersionStatusBadge: React.FC<{ status?: NodeVersionStatus }> = ({
    status,
}) => {
    if (status && statusMap[status]) {
        const { color, label } = statusMap[status]
        return <Badge color={color}>{label}</Badge>
    }

    return null
}

export default NodeVersionStatusBadge
