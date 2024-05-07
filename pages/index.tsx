import { useQuery } from '@tanstack/react-query'
import Registry from '../components/registry/Registry'
import {
    getListAllNodesQueryOptions,
    getListPublishersQueryOptions,
    listPublishers,
    useListAllNodes,
} from '../src/api/generated'
import { useEffect } from 'react'

function NodeList() {
    const getAllNodesQuery = getListAllNodesQueryOptions({
        page: 1,
        limit: 15,
    })
    if (getAllNodesQuery?.queryKey && getAllNodesQuery?.queryFn) {
        //@ts-ignore
        getAllNodesQuery.queryFn(getAllNodesQuery?.queryKey)
    }
    // console.log(":")
    // const nodes = getAllNodesQuery.data?.nodes || []
    // const { data, error, laoding } = useListAllNodes
    useEffect(() => {
        console.log('------------', getAllNodesQuery)
    }, [getAllNodesQuery])
    return (
        <>
            <Registry />
        </>
    )
}

export default NodeList
