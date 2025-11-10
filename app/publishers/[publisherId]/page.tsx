'use client'
import { Breadcrumb, Spinner } from 'flowbite-react'
import { useParams, useRouter } from 'next/navigation'
import { HiHome } from 'react-icons/hi'
import withAuth from '@/components/common/HOC/withAuth'
import PublisherDetail from '@/components/publisher/PublisherDetail'
import { useGetPublisher } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'

function PublisherDetails() {
  const router = useRouter()
  const params = useParams()
  const publisherId = params?.publisherId as string
  const { t } = useNextTranslation()
  const { data, isError, isLoading } = useGetPublisher(publisherId)

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

// TODO: Re-enable withAuth after migrating HOC to App Router
// export default withAuth(PublisherDetails)
export default PublisherDetails
