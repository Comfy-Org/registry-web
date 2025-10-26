import { Button } from 'flowbite-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { HiPencil } from 'react-icons/hi'
import { Node } from '@/src/api/generated'
import { useNextTranslation } from '@/src/hooks/i18n'
import { PublisherId } from '../Search/PublisherId'
import { AdminNodeClaimModal } from './AdminNodeClaimModal'

export default function UnclaimedNodeCard({
    node,
    onSuccess,
}: {
    node: Node
    onSuccess?: () => void
}) {
    const { t } = useNextTranslation()
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
    const { name, description, icon, rating, id } = node
    const buttonLink = `/nodes/${id}`

    const publisherId = node.publisher?.id
    if (!publisherId) {
        console.error('Publisher ID is missing for node:', node)
        return null
    }

    return (
        <div className="flex p-2 bg-gray-800 border border-gray-700 rounded-lg shadow sm:flex lg:p-4">
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

            <div className="flex flex-col px-4 flex-grow">
                <div className="flex justify-between relative">
                    <h6 className="mb-2 font-bold tracking-tight text-white">
                        {name}
                    </h6>
                    <Button
                        size="xs"
                        color="light"
                        onClick={() => setIsClaimModalOpen(true)}
                        className="flex items-center absolute top-2 right-2"
                    >
                        <HiPencil className="mr-1" />
                        {t('Edit')}
                    </Button>
                </div>

                <span className="text-xs text-gray-300">
                    <PublisherId publisherId={publisherId} />
                </span>
                <div className="mt-3 mb-1 overflow-hidden text-xs font-light text-gray-300 flex items-end w-full text-ellipsis">
                    <p className="flex-0 line-clamp-2 max-w-full">
                        {description}
                    </p>
                    <p className="text-blue-400 cursor-pointer">
                        <Link href={buttonLink}>{t('More')}</Link>
                    </p>
                </div>
            </div>

            {/* Claim Modal */}
            <AdminNodeClaimModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                node={node}
                onSuccess={onSuccess}
            />
        </div>
    )
}
