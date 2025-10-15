import withAuth from '@/components/common/HOC/withAuth'
import { useNextTranslation } from '@/src/hooks/i18n'
import { useRouter } from 'next/router'
import PublisherListNodes from '../components/publisher/PublisherListNodes'
import UnifiedBreadcrumb, {
    createHomeBreadcrumb,
    createNodesBreadcrumb,
} from '@/components/common/UnifiedBreadcrumb'

function PublisherNodeList() {
    const router = useRouter()
    const { t } = useNextTranslation()

    const breadcrumbItems = [createHomeBreadcrumb(t), createNodesBreadcrumb(t)]

    return (
        <div className="p-4">
            <UnifiedBreadcrumb items={breadcrumbItems} />
            <PublisherListNodes />
        </div>
    )
}

export default withAuth(PublisherNodeList)
