import withAuth from '@/components/common/HOC/newAuth'
import Nodes from '../components/nodes/Nodes'

function NodeList() {
    return (
        <>
            <Nodes />
        </>
    )
}
export default NodeList
// export default withAuth(NodeList)
