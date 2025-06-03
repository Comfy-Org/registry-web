import withAdmin from '@/components/common/HOC/authAdmin'
import { Breadcrumb, Button } from 'flowbite-react'
import { useRouter } from 'next/router'
import {
    HiHome,
    HiOutlineAdjustments,
    HiOutlineClipboardCheck,
    HiOutlineCollection,
    HiOutlineDuplicate
} from 'react-icons/hi'

export default withAdmin(AdminDashboard)
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/search-ranking')}
                    className="w-full h-48 flex flex-col items-center justify-center p-6"
                >
                    <HiOutlineAdjustments className="h-20 w-20 mb-4" />
                    <span className="text-center">Search Ranking Table</span>
                </Button>
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/preemptive-names')}
                    className="w-full h-48 flex flex-col items-center justify-center p-6"
                >
                    <HiOutlineDuplicate className="h-20 w-20 mb-4" />
                    <span className="text-center">Preemptive Names Management</span>
                </Button>
                <Button
                    color="blue"
                    onClick={() =>
                        router.push('/admin/nodeversions?filter=flagged')
                    }
                    className="w-full h-48 flex flex-col items-center justify-center p-6"
                >
                    <HiOutlineClipboardCheck className="h-20 w-20 mb-4" />
                    <span className="text-center">Review Node Versions</span>
                </Button>
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/claim-nodes')}
                    className="w-full h-48 flex flex-col items-center justify-center p-6"
                >
                    <HiOutlineCollection className="h-20 w-20 mb-4" />
                    <span className="text-center">Manage Unclaimed Nodes</span>
                </Button>
                {/* Add more admin links here as needed */}
            </div>
        </div>
    )
}
