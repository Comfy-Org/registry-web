import withAdmin from '@/components/common/HOC/authAdmin'
import Breadcrumb from '@/components/common/Breadcrumb'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { useRouter } from 'next/router'

export default withAdmin(AddUnclaimedNodePage)

function AddUnclaimedNodePage() {
    const router = useRouter()
    return (
        <div>
            <Breadcrumb
                items={[
                    {
                        label: 'Admin',
                        href: '/admin',
                    },
                    {
                        label: 'Add Unclaimed Node',
                        href: '/admin/add-unclaimed-node',
                        active: true
                    }
                ]}
            />
            <AdminCreateNodeFormModal open onClose={() => router.push('/admin/')} />
        </div>
    )
}
