'use client'
import { Breadcrumb, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import withAuth from '@/components/common/HOC/withAuth'
import PublisherDetail from '@/components/publisher/PublisherDetail'
import { useGetPublisher } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

function PublisherDetails() {
  const router = useRouter()
  const { publisherId } = router.query
  const { t } = useNextTranslation()
  const { data, isError, isLoading } = useGetPublisher(publisherId as string)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="" />
      </div>
    )
  }

  if (!data || isError) {
    return <div>Not found</div>
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
          <Breadcrumb.Item className="text-blue-500">
            {data.name}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <PublisherDetail publisher={data} />
    </div>
  )
}

export default withAuth(PublisherDetails)
