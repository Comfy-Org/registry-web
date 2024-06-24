import withAuth from '@/components/common/HOC/withAuth'
import PublisherListNodes from '../components/publisher/PublisherListNodes'

function PublisherNodeList() {
    return (
        <>
            <PublisherListNodes />
        </>
    )
}

export default withAuth(PublisherNodeList)
