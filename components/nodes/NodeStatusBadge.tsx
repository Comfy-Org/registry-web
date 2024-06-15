import { Badge } from 'flowbite-react'
import { NodeStatus } from 'src/api/generated'

const NodeStatusBadge: React.FC<{ status?: NodeStatus }> = ({ status }) => {
    // TODO(robinjhuang): Add badge for active status
    if (status === NodeStatus.NodeStatusBanned) {
        return <Badge color="failure">Banned</Badge>
    }

    return null
}

export default NodeStatusBadge
