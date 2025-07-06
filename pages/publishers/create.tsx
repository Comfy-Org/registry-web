import withAuth from '@/components/common/HOC/withAuth'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import CreatePublisherForm from '../../components/publisher/CreatePublisherForm'

const CreatePublisher = () => {
  const router = useRouter()
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
          <Breadcrumb.Item className="dark">
            {t('Create Publisher')}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <CreatePublisherForm />
    </div>
  )
}

export default withAuth(CreatePublisher)
