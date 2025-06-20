import withAuth from '@/components/common/HOC/withAuth'
import PublisherDetail from '@/components/publisher/PublisherDetail'
import { Breadcrumb, Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { useGetPublisher } from 'src/api/generated'

function PublisherDetails() {
    const router = useRouter()
    const { publisherId } = router.query
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
            <Breadcrumb className="py-4">
                <Breadcrumb.Item
                    href="/"
                    icon={HiHome}
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/')
                    }}
                >
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {data.name}
                </Breadcrumb.Item>
            </Breadcrumb>

            <PublisherDetail publisher={data} />
        </div>
    )
}

export default withAuth(PublisherDetails)
