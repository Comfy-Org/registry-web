import withAdmin from '@/components/common/HOC/authAdmin'
import AdminTreeNavigation from '@/components/admin/AdminTreeNavigation'
import { useNextTranslation } from '@/src/hooks/i18n'
import { Breadcrumb } from 'flowbite-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
    HiHome,
    HiOutlineAdjustments,
    HiOutlineClipboardCheck,
    HiOutlineCollection,
    HiOutlineDuplicate,
    HiOutlineSupport,
} from 'react-icons/hi'

export default withAdmin(AdminDashboard)
function AdminDashboard() {
    const router = useRouter()
    const { t } = useNextTranslation()

    return (
        <div className="p-4">
            <Breadcrumb className="py-4">
                <Breadcrumb.Item href="/" icon={HiHome} className="dark">
                    {t('Home')}
                </Breadcrumb.Item>
                <Breadcrumb.Item href="#" className="dark">
                    {t('Admin Dashboard')}
                </Breadcrumb.Item>
            </Breadcrumb>

            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                {t('Admin Dashboard')}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                    <AdminTreeNavigation />
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-200 mb-4">
                            {t('Quick Actions')}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/admin/search-ranking"
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center transition-colors"
                            >
                                <HiOutlineAdjustments className="h-8 w-8 mr-3" />
                                <span>{t('Search Ranking Table')}</span>
                            </Link>
                            <Link
                                href="/admin/nodeversions?filter=flagged"
                                className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg p-4 flex items-center transition-colors"
                            >
                                <HiOutlineClipboardCheck className="h-8 w-8 mr-3" />
                                <span>{t('Review Flagged Versions')}</span>
                            </Link>
                            <Link
                                href="/admin/claim-nodes"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex items-center transition-colors"
                            >
                                <HiOutlineCollection className="h-8 w-8 mr-3" />
                                <span>{t('Manage Unclaimed Nodes')}</span>
                            </Link>
                            <Link
                                href="/admin/nodes"
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 flex items-center transition-colors"
                            >
                                <HiOutlineCollection className="h-8 w-8 mr-3" />
                                <span>{t('Manage All Nodes')}</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
