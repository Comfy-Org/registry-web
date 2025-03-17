import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeModal } from '@/components/nodes/AdminCreateNodeModal'
import { useRouter } from 'next/router'

export default withAdmin(AddUnclaimedNodePage)

function AddUnclaimedNodePage() {
    const router = useRouter()
    return <AdminCreateNodeModal open onClose={() => router.push('/admin/')} />
}
