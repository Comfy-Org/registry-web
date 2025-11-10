import { useRouter } from 'next/router'
import withAdmin from '@/components/common/HOC/authAdmin'
import {
  createAdminDashboardBreadcrumb,
  createHomeBreadcrumb,
  createUnclaimedNodesBreadcrumb,
  UnifiedBreadcrumb,
} from '@/components/common/UnifiedBreadcrumb'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { useNextTranslation } from '@/src/hooks/i18n'

export default withAdmin(AddUnclaimedNodePage)

function AddUnclaimedNodePage() {
  const { t } = useNextTranslation()
  const router = useRouter()

  // Create breadcrumb items
  const breadcrumbItems = [
    createHomeBreadcrumb(t),
    createAdminDashboardBreadcrumb(t),
    createUnclaimedNodesBreadcrumb(t),
    { href: '', label: t('Add Unclaimed Node') },
  ]

  return (
    <div className="p-4">
      <UnifiedBreadcrumb items={breadcrumbItems} />

      <AdminCreateNodeFormModal open onClose={() => router.push('/admin/')} />
    </div>
  )
}
