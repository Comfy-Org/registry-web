import { useNextTranslation } from '@/src/hooks/i18n'
import { useRouter } from 'next/router'
import NodeDetails from '../../components/nodes/NodeDetails'
import UnifiedBreadcrumb, {
    createHomeBreadcrumb,
    createAllNodesBreadcrumb,
    createNodeDetailBreadcrumb,
} from '@/components/common/UnifiedBreadcrumb'

const NodeView = () => {
    const router = useRouter()
    const { nodeId } = router.query
    const { t } = useNextTranslation()

    const breadcrumbItems = [
        createHomeBreadcrumb(t),
        createAllNodesBreadcrumb(t),
        createNodeDetailBreadcrumb(nodeId as string),
    ]

    return (
        <div className="p-4">
            <div className="py-4">
                <UnifiedBreadcrumb items={breadcrumbItems} />
            </div>

            <NodeDetails />
        </div>
    )
}

export default NodeView
