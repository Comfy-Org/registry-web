'use client'
import { Breadcrumb, Card } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { HiHome } from 'react-icons/hi'
import withAuth from '@/components/common/HOC/withAuth'
import CreatePublisherFormContent from '@/components/publisher/CreatePublisherFormContent'
import { useNextTranslation } from '@/src/hooks/i18n'

const CreatePublisher = () => {
  const router = useRouter()
  const { t } = useNextTranslation()

  const handleSuccess = (username: string) => {
    router.push(`/publishers/${username}`)
  }

  const handleCancel = () => {
    router.back()
  }

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

      <section className="p-0">
        <div className="flex items-center justify-center px-0 py-4 mx-auto">
          <div className="w-full mx-auto shadow sm:max-w-lg">
            <Card className="p-2 bg-gray-800 border border-gray-700 md:p-6 rounded-2xl">
              <CreatePublisherFormContent
                onSuccess={handleSuccess}
                onCancel={handleCancel}
                showTitle={true}
              />
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default withAuth(CreatePublisher)
