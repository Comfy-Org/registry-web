import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import NodeDetails from '../../components/nodes/NodeDetails'

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
                <Breadcrumb.Item>
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
