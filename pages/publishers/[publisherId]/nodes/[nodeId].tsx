import NodeDetails from '@/components/nodes/NodeDetails'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useGetPublisher } from '@/src/api/generated'

const NodeView = () => {
    const router = useRouter()
    const { publisherId, nodeId } = router.query
    const { data: publisher } = useGetPublisher(publisherId as string)
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
                    {publisher?.name || publisherId}
                </Breadcrumb.Item>
                <Breadcrumb.Item className="text-blue-500">
                    {nodeId as string}
                </Breadcrumb.Item>
            </Breadcrumb>

            <NodeDetails />
        </div>
    )
}

export default NodeView
