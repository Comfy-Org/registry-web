import { Badge } from 'flowbite-react'
import { NodeVersionStatus } from 'src/api/generated'

const NodeVersionStatusBadge: React.FC<{ status?: NodeVersionStatus }> = ({
    status,
}) => {
    if (status === NodeVersionStatus.NodeVersionStatusActive) {
        return <Badge color="success">Live</Badge>
    }

    if (
        status === NodeVersionStatus.NodeVersionStatusPending ||
        NodeVersionStatus.NodeVersionStatusFlagged
    ) {
        return <Badge color="warning">Pending Review</Badge>
    }

    if (status === NodeVersionStatus.NodeVersionStatusBanned) {
        return <Badge color="failure">Banned</Badge>
    }

    return null
}

export default NodeVersionStatusBadge
