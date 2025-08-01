import { useNextTranslation } from '@/src/hooks/i18n'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Node } from '@/src/api/generated'
import { ShortNumber } from '@lytieuphong/short-number'
import { HiDownload, HiStar } from 'react-icons/hi'
interface NodesCard {
    node: Node
    buttonLink: string
}
const NodesCard: React.FC<NodesCard> = ({
    node: { name, description, icon, downloads, rating, id, github_stars },
    buttonLink,
}) => {
    const { t } = useNextTranslation()
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
                        <Link href={buttonLink}>{t('More')}</Link>
                    </p>
                </div>

                <div className="flex mt-2">
                    {downloads != null && downloads > 0 && (
                        <div className="flex justify-center text-center align-center">
                            <HiDownload
                                className="w-4 h-4 text-gray-300"
                                title={t('Downloads')}
                            />
                            <p className="ml-1 text-xs font-bold text-gray-300">
                                {ShortNumber(downloads)}
                            </p>
                        </div>
                    )}
                    {github_stars != null && github_stars > 0 && (
                        <div className="flex justify-center ml-2 text-center align-center">
                            <HiStar
                                className="w-4 h-4 text-yellow-400"
                                title={t('GitHub Stars')}
                            />
                            <p className="ml-1 text-xs font-bold text-gray-300">
                                {ShortNumber(github_stars)}
                            </p>
                        </div>
                    )}
                    {rating != null && rating > 0 && (
                        <div className="flex justify-center ml-2 text-center align-center">
                            <HiStar className="w-4 h-4 text-blue-400" />

                            <p className="ml-1 text-xs font-bold text-gray-300">
                                {rating.toFixed(1)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default NodesCard
