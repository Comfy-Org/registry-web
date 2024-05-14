import withAuth from '@/components/common/HOC/newAuth'
import PublisherListNodes from '../components/publisher/PublisherListNodes'

function NodeList() {
    return (
        <>
            <PublisherListNodes />
        </>
    )
}

export default withAuth(NodeList)
