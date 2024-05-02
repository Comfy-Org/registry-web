import React from 'react'
import { useListNodes } from '../src/api/generated'
import NodesCard from '../components/nodes/NodesCard'

// List all custom nodes.
function NodeList() {
    return (
        <>
            <NodesCard />
        </>
    )
}

export default NodeList
