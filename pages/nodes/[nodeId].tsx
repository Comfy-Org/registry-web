import React from 'react'
import NodeDetails from '../../components/nodes/NodeDetails'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'

const NodeView = () => {
    const router = useRouter()
    const { nodeId } = router.query
    
    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item
                    href="/"
                    icon={HiHome}
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/')
                    }}
                >
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item
                    href="/nodes"
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/nodes')
                    }}
                >
                    Nodes
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {nodeId as string}
                </Breadcrumb.Item>
            </Breadcrumb>
            
            <NodeDetails />
        </div>
    )
}

export default NodeView
