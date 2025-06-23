import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'

export default withAdmin(AddUnclaimedNodePage)

function AddUnclaimedNodePage() {
    const { t } = useNextTranslation()
    const router = useRouter()
    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item
                    href="/admin"
                    icon={HiHome}
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/admin')
                    }}
                    className="dark"
                >
                    {t('Admin Dashboard')}
                </Breadcrumb.Item>
                <Breadcrumb.Item
                    href="/admin/claim-nodes"
                    onClick={(e) => {
                        e.preventDefault()
                        router.push('/admin/claim-nodes')
                    }}
                    className="dark"
                >
                    {t('Unclaimed Nodes')}
                </Breadcrumb.Item>
                <Breadcrumb.Item className="dark">
                    {t('Add Unclaimed Node')}
                </Breadcrumb.Item>
            </Breadcrumb>

            <AdminCreateNodeFormModal
                open
                onClose={() => router.push('/admin/')}
            />
        </div>
    )
}
