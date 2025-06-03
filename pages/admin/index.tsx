import withAdmin from '@/components/common/HOC/authAdmin'
import { Breadcrumb, Button } from 'flowbite-react'
import { useRouter } from 'next/router'
import {
    HiHome,
    HiOutlineClipboardCheck,
    HiOutlineCollection,
} from 'react-icons/hi'

function AdminDashboard() {
    const router = useRouter()

    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="#" icon={HiHome}>
                    Admin Dashboard
                </Breadcrumb.Item>
            </Breadcrumb>

            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                Admin Dashboard
            </h1>
            <div className="flex flex-col gap-4">
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/search-ranking')}
                    className="w-fit"
                >
                    Search Ranking
                </Button>
                <Button
                    color="blue"
                    onClick={() =>
                        router.push('/admin/nodeversions?filter=flagged')
                    }
                    className="w-fit"
                >
                    <HiOutlineClipboardCheck className="mr-2 h-5 w-5" />
                    Review Node Versions
                </Button>
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/claim-nodes')}
                    className="w-fit"
                >
                    <HiOutlineCollection className="mr-2 h-5 w-5" />
                    Manage Unclaimed Nodes
                </Button>
                {/* Add more admin links here as needed */}
            </div>
        </div>
    )
}

export default withAdmin(AdminDashboard)
