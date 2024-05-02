import { useListAllNodes } from '../src/api/generated'

function NodeList() {
    const getAllNodesQuery = useListAllNodes({
        page: 1,
        limit: 15
    })

    const nodes = getAllNodesQuery.data?.nodes || []
}

export default NodeList
