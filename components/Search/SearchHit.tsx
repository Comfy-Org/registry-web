import React from 'react'
import { Snippet } from 'react-instantsearch'
import { useRouter } from 'next/router'

type HitProps = {
    hit: {
        id: string
        name: string
        publisher_id: string
        total_install: number
        version: string
    }
}

const Hit: React.FC<HitProps> = ({ hit }) => {
    const router = useRouter()

    const handleClick = () => {
        router.push(`/nodes/${hit.id}`)
    }

    return (
        <div
            className="flex flex-col bg-gray-800 rounded-lg shadow cursor-pointer h-full dark:border-gray-700 lg:p-4"
            onClick={handleClick}
        >
            <div className="flex flex-col px-4">
                <h6 className="mb-2 text-base font-bold tracking-tight text-white break-words">
                    <Snippet hit={hit} attribute="name" />
                </h6>

                {hit.version && (
                    <p className="mb-1 text-xs tracking-tight text-white">
                        <span>v{hit.version}</span>
                    </p>
                )}

                <p className="mb-1 text-xs font-light text-white text-nowrap mt-2">
                    {hit.publisher_id}
                </p>

                <div className="flex items-center flex-start align-center gap-1 mt-2">
                    {hit.total_install != 0 && (
                        <p className="flex justify-center text-center align-center">
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
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                                />
                            </svg>
                            <p className="ml-1 text-xs font-bold text-white">
                                {hit.total_install}
                            </p>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Hit
