'use client'
import { Breadcrumb } from 'flowbite-react'
import { useParams, useRouter } from 'next/navigation'
import { HiHome } from 'react-icons/hi'
import NodeDetails from '@/components/nodes/NodeDetails'
import { useNextTranslation } from '@/src/hooks/i18n'

export default function NodeView() {
  const router = useRouter()
  const params = useParams()
  const nodeId = params.nodeId as string
  const { t } = useNextTranslation()

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
          <Breadcrumb.Item className="dark">{t('All Nodes')}</Breadcrumb.Item>
          <Breadcrumb.Item className="dark text-blue-500">
            {nodeId}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <NodeDetails />
    </div>
  )
}
