import withAdmin from '@/components/common/HOC/authAdmin'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/admin/search-ranking"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full h-48 flex flex-col items-center justify-center p-6 transition-colors"
                >
                    <HiOutlineAdjustments className="h-20 w-20 mb-4" />
                    <span className="text-center">
                        {t('Search Ranking Table')}
                    </span>
                </Link>
                <Link
                    href="/admin/preempted-comfy-node-names"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full h-48 flex flex-col items-center justify-center p-6 transition-colors"
                >
                    <HiOutlineDuplicate className="h-20 w-20 mb-4" />
                    <span className="text-center">
                        {t('Preempted Comfy Node Names Management')}
                    </span>
                </Link>
                <Link
                    href="/admin/nodeversions?filter=flagged"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full h-48 flex flex-col items-center justify-center p-6 transition-colors"
                >
                    <HiOutlineClipboardCheck className="h-20 w-20 mb-4" />
                    <span className="text-center">
                        {t('Review Node Versions')}
                    </span>
                </Link>
                <Link
                    href="/admin/claim-nodes"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full h-48 flex flex-col items-center justify-center p-6 transition-colors"
                >
                    <HiOutlineCollection className="h-20 w-20 mb-4" />
                    <span className="text-center">
                        {t('Manage Unclaimed Nodes')}
                    </span>
                </Link>
                <Link
                    href="/admin/node-version-compatibility"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg w-full h-48 flex flex-col items-center justify-center p-6 transition-colors"
                >
                    <HiOutlineSupport className="h-20 w-20 mb-4" />
                    <span className="text-center">
                        {t('Node Version Compatibility')}
                    </span>
                </Link>
                {/* Add more admin links here as needed */}
            </div>
        </div>
    )
}
