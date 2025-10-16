import React, { FC, SVGProps } from 'react'
import { Breadcrumb } from 'flowbite-react'
import { useRouter } from 'next/router'
import { HiHome } from 'react-icons/hi'
import { themeConfig } from '@/utils/themeConfig'

interface BreadcrumbItem {
    label: string
    href?: string
    onClick?: (e: React.MouseEvent) => void
    icon?: FC<SVGProps<SVGSVGElement>>
    isActive?: boolean
}

interface UnifiedBreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

const UnifiedBreadcrumb: React.FC<UnifiedBreadcrumbProps> = ({
    items,
    className = '',
}) => {
    const router = useRouter()

    return (
        <Breadcrumb className={`py-4 ${className}`}>
            {items.map((item, index) => (
                <Breadcrumb.Item
                    key={index}
                    href={item.href}
                    icon={item.icon}
                    onClick={item.onClick}
                    className={`${themeConfig.breadcrumb.link} ${
                        item.isActive ? 'text-blue-500 dark:text-blue-400' : ''
                    }`}
                >
                    {item.label}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    )
}

export { UnifiedBreadcrumb }
export default UnifiedBreadcrumb

export const createHomeBreadcrumb = (t: (key: string) => string) => ({
    label: t('Home'),
    href: '/',
    icon: HiHome,
    onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        window.location.href = '/'
    },
})

export const createNodesBreadcrumb = (t: (key: string) => string) => ({
    label: t('Your Nodes'),
})

export const createAllNodesBreadcrumb = (t: (key: string) => string) => ({
    label: t('All Nodes'),
})

export const createNodeDetailBreadcrumb = (nodeId: string) => ({
    label: nodeId,
    isActive: true,
})

export const createPublisherBreadcrumb = (publisherName: string) => ({
    label: publisherName,
    isActive: true,
})

export const createAdminDashboardBreadcrumb = (
    t: (key: string) => string,
    isCurrentPage = false
) => ({
    label: t('Admin Dashboard'),
    href: isCurrentPage ? undefined : '/admin',
    onClick: isCurrentPage
        ? undefined
        : (e: React.MouseEvent) => {
              e.preventDefault()
              window.location.href = '/admin'
          },
})

export const createUnclaimedNodesBreadcrumb = (t: (key: string) => string) => ({
    label: t('Unclaimed Nodes'),
})
