import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
interface RegistryCard {
    name: string
    version: string
    id: string | number
    license: string
    description: string
    image: string
    rating: string | number
    downloads: string | number
    isLoggedIn?: boolean
}
const RegistryCard: React.FC<RegistryCard> = ({
    name,
    id,
    version,
    license,
    description,
    image,
    rating,
    downloads,
    isLoggedIn,
}) => {
    const router = useRouter()
    const handleClick = () => {
        if (!isLoggedIn) {
            router.push('/nodes/publisher-detail/1')
        } else {
            router.push('/nodes/1')
        }
    }
    return (
        <div
            className="flex bg-gray-800 rounded-lg shadow cursor-pointer h-fit sm:flex dark:border-gray-700 lg:p-4"
            onClick={handleClick}
        >
            <div>
                {' '}
                <img
                    className="object-cover w-20 h-20 rounded-3lg sm:rounded-lg"
                    src={image}
                    alt={`${name}'s Avatar`}
                />
            </div>

            <div className="flex flex-col px-4">
                <h6 className="mb-2 text-base font-bold tracking-tight text-white">
                    {name}
                </h6>

                <p className="mb-1 text-xs tracking-tight text-white">
                    <span>{version}</span>
                </p>

                <p className="mb-1 text-xs font-light text-white text-nowrap">
                    {description}
                </p>
                <span className="text-xs text-white">License:{license}</span>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex justify-center text-center align-center">
                        <svg
                            className="w-4 h-4 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                            />
                        </svg>

                        <p className="ml-1 text-xs font-bold text-white">
                            {downloads}
                        </p>
                    </div>
                    <div className="flex justify-center text-center align-center">
                        <svg
                            className="w-4 h-4 text-white"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-width="2"
                                d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.337 1.016l1.03 4.119c.214.858-.71 1.552-1.474 1.106l-3.913-2.281a1 1 0 0 0-1.008 0L7.583 20.8c-.764.446-1.688-.248-1.474-1.106l1.03-4.119A1 1 0 0 0 6.8 14.56l-3.33-2.723c-.698-.571-.342-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z"
                            />
                        </svg>

                        <p className="ml-1 text-xs font-bold text-white">
                            {rating}sss
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default RegistryCard
