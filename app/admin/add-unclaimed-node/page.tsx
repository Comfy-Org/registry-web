'use client'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import { HiHome } from 'react-icons/hi'
import withAdmin from '@/components/common/HOC/authAdmin'
import { AdminCreateNodeFormModal } from '@/components/nodes/AdminCreateNodeFormModal'
import { useNextTranslation } from '@/src/hooks/i18n'

function AddUnclaimedNodePage() {
  const { t } = useNextTranslation()
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
          {t('Home')}
        </Breadcrumb.Item>
        <Breadcrumb.Item
          href="/admin"
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

      <AdminCreateNodeFormModal open onClose={() => router.push('/admin/')} />
    </div>
  )
}

// TODO: Re-enable withAdmin after migrating HOC to App Router
// const Wrapped = withAdmin(AddUnclaimedNodePage)
export default AddUnclaimedNodePage

export const dynamic = 'force-dynamic'
