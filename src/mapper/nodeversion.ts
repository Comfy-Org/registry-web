import { NodeVersionStatus } from 'src/api/generated'

export const NodeVersionStatusToReadable = (status?: NodeVersionStatus) => {
    if (!status) {
        return 'Unknown'
    }
    switch (status) {
        case NodeVersionStatus.NodeVersionStatusFlagged:
            return 'Flagged'
        case NodeVersionStatus.NodeVersionStatusPending:
            return 'Pending'
        case NodeVersionStatus.NodeVersionStatusBanned:
            return 'Banned'
        case NodeVersionStatus.NodeVersionStatusActive:
            return 'Active'
        case NodeVersionStatus.NodeVersionStatusDeleted:
            return 'Deleted'
        default:
            throw new Error('Unknown node version status')
    }
}
