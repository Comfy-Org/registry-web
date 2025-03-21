import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { useRouter } from 'next/router'

export default withAdmin(AddUnclaimedNodePage)

function AddUnclaimedNodePage() {
    const router = useRouter()
    return <AdminCreateNodeFormModal open onClose={() => router.push('/admin/')} />
}
