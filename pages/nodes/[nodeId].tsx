import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import NodeDetails from '../../components/nodes/NodeDetails'
import { useGetNode } from '@/src/api/generated'

// TODO(sno): try static props this later
// export async function getStaticProps({ params: { nodeId } }: { params: { nodeId: string } }) {
//     return { props: { nodeId, }, }
// }

const NodeView = () => {
    const router = useRouter()
    const { nodeId } = router.query as { nodeId?: string }
    const { t } = useNextTranslation()
    const { data: node } = useGetNode(nodeId ?? '', undefined, {
        query: { enabled: !!nodeId },
    })

    return (
        <div className="p-4">
            <div className="py-4">
                <Breadcrumb>
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
                    <Breadcrumb.Item className="dark">
                        {t('All Nodes')}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item className="dark text-blue-500">
                        {node?.name || (nodeId as string)}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            {!!nodeId && <NodeDetails nodeId={nodeId} />}
        </div>
    )
}

export default NodeView
