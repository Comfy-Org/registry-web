import * as React from 'react';
import Registry from '../components/registry/Registry'
import {
    useListAllNodes,
} from '../src/api/generated'
import { Spinner } from 'flowbite-react';

function NodeList() {
    const [page, setPage] = React.useState<number>(1)
    const getAllNodesQuery = useListAllNodes({
        page: page,
        limit: 15,
    })
    const nodes = getAllNodesQuery.data?.nodes || []

    if (getAllNodesQuery.isLoading) {
        return <div className="flex items-center justify-center h-screen">
            <Spinner className="" />
        </div>
    }

    return (
        <>
            <Registry nodes={nodes} totalPages={getAllNodesQuery.data?.totalPages || 1} currentPage={getAllNodesQuery.data?.page || 1} setPage={setPage} />
        </>
    )
}

export default NodeList
