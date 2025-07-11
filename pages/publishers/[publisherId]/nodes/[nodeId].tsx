import NodeDetails from '@/components/nodes/NodeDetails'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useGetNode, useGetPublisher } from '@/src/api/generated'

const NodeView = () => {
    const router = useRouter()
    const { publisherId, nodeId } = router.query as {
        publisherId?: string
        nodeId?: string
    }
    const { data: node } = useGetNode(publisherId as string)
    const { t } = useNextTranslation()

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
                    {t('Home')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                    href={`/publishers/${publisherId}`}
                    onClick={(e) => {
                        e.preventDefault()
                        router.push(`/publishers/${publisherId}`)
                    }}
                    className="dark"
                >
                    {node?.publisher?.name || publisherId}
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-blue-500">
                    {node?.name || (nodeId as string)}
                </Breadcrumb.Item>
            </Breadcrumb>

            {!!nodeId && <NodeDetails nodeId={nodeId} publisherId="" />}
        </div>
    )
}

export default NodeView
