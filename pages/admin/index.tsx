import withAdmin from '@/components/common/HOC/authAdmin'
import { Button } from 'flowbite-react'
import { useRouter } from 'next/router'

function AdminDashboard() {
    const router = useRouter()

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                Admin Dashboard
            </h1>
            <div className="flex flex-col gap-4">
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/nodeversions')}
                    className="w-fit"
                >
                    Review Node Versions
                </Button>
                <Button
                    color="blue"
                    onClick={() => router.push('/admin/add-unclaimed-node')}
                    className="w-fit"
                >
                    Add Unclaimed Node
                </Button>
                {/* Add more admin links here as needed */}
            </div>
        </div>
    )
}

export default withAdmin(AdminDashboard)
