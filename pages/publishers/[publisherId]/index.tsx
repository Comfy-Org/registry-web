import withAuth from '@/components/common/HOC/withAuth'
import PublisherDetail from '@/components/publisher/PublisherDetail'
import { Spinner } from 'flowbite-react'
import { useRouter } from 'next/router'
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
        <>
            <PublisherDetail publisher={data} />
        </>
    )
}

export default PublisherDetails
