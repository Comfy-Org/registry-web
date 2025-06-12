import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Node } from 'src/api/generated'
interface NodesCard {
    node: Node
    buttonLink: string
}
const NodesCard: React.FC<NodesCard> = ({
    node: { name, description, icon, downloads, rating, id },
    buttonLink,
}) => {
    return (
        <div className="flex p-2 bg-gray-800 border border-gray-700 rounded-lg shadow bg-gray-50 sm:flex lg:p-4">
            {icon && (
                <div className="w-[250px]">
                    <Image
                        className="rounded-lg sm:rounded-lg"
                        src={icon || ''}
                        alt={`${name}'s Avatar`}
                        width={200}
                        height={200}
                    />
                </div>
            )}

            <div className="flex flex-col px-4">
                <h6 className="mb-2 font-bold tracking-tight text-white">
                    {name}
                </h6>

                <span className="text-xs text-gray-300">{name}</span>
                <div className="mt-3 mb-1 overflow-hidden text-xs text-gray-[300] font-light text-gray-500 text-gray-400 flex items-end">
                    <p className="flex-grow line-clamp-2">{description}</p>
                    <p className="text-blue-500 cursor-pointer">
                        {' '}
                        <Link href={buttonLink}>More</Link>
                    </p>
                </div>

                <div className="flex mt-2">
                    {/* {downloads != 0 && (
                        <div className="flex justify-center text-center align-center">
                            <svg
                                className="w-4 h-4 text-gray-300"
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

                            <p className="ml-1 text-xs font-bold text-gray-300">
                                {downloads}
                            </p>
                        </div>
                    )} */}
                    {rating != 0 && (
                        <div className="flex justify-center ml-2 text-center align-center">
                            <svg
                                className="w-4 h-4 text-gray-300"
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

                            <p className="ml-1 text-xs font-bold text-gray-300">
                                {rating}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default NodesCard
