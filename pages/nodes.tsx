import withAuth from '@/components/common/HOC/withAuth'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import PublisherListNodes from '../components/publisher/PublisherListNodes'

function PublisherNodeList() {
    const router = useRouter()

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
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item className="dark">Your Nodes</Breadcrumb.Item>
            </Breadcrumb>

            <PublisherListNodes />
        </div>
    )
}

export default withAuth(PublisherNodeList)
