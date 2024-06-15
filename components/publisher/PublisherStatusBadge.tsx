import { Badge } from 'flowbite-react'
import { PublisherStatus } from 'src/api/generated'

const PublisherStatusBadge: React.FC<{ status?: PublisherStatus }> = ({
    status,
}) => {
    if (status === PublisherStatus.PublisherStatusBanned) {
        return <Badge color="failure">Banned</Badge>
    }

    return null
}

export default PublisherStatusBadge
