import Link from 'next/link'
import React from 'react'
import { HiChevronRight } from 'react-icons/hi'

export interface BreadcrumbItem {
    label: string
    href: string
    active?: boolean
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link
                        href="/"
                        className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white"
                    >
                        Home
                    </Link>
                </li>

                {items.map((item, index) => (
                    <li key={index} className="inline-flex items-center">
                        <HiChevronRight className="w-4 h-4 text-gray-400" />
                        {item.active ? (
                            <span
                                className="ml-1 text-sm font-medium text-blue-500 md:ml-2"
                                aria-current="page"
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="ml-1 text-sm font-medium text-gray-400 hover:text-white md:ml-2"
                            >
                                {item.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}

export default Breadcrumb
