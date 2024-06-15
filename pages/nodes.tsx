import withAuth from '@/components/common/HOC/newAuth'
import PublisherListNodes from '../components/publisher/PublisherListNodes'

function PublisherNodeList() {
    return (
        <>
            <PublisherListNodes />
        </>
    )
}

export default withAuth(PublisherNodeList)
