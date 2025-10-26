import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import withAuth from '@/components/common/HOC/withAuth'
import { useNextTranslation } from '@/src/hooks/i18n'
import PublisherListNodes from '../components/publisher/PublisherListNodes'

function PublisherNodeList() {
  const router = useRouter()
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
        <Breadcrumb.Item className="dark">{t('Your Nodes')}</Breadcrumb.Item>
      </Breadcrumb>

      <PublisherListNodes />
    </div>
  )
}

export default withAuth(PublisherNodeList)
