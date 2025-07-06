
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
                    className="dark"
                >
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item className="dark">Nodes</Breadcrumb.Item>
                <Breadcrumb.Item className="text-blue-500">
                    {nodeId as string}
                </Breadcrumb.Item>
            </Breadcrumb>

            <NodeDetails />
        </div>
    )
}

export default NodeView
