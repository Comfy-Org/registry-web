import Registry from '../components/registry/Registry'
import { useListAllNodes } from '../src/api/generated'

function NodeList() {
    const getAllNodesQuery = useListAllNodes({
        page: 1,
        limit: 15,
    })

    const nodes = getAllNodesQuery.data?.nodes || []
    return (
        <>
            <Registry />
        </>
    )
}

export default NodeList
