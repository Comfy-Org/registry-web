import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'

export function PublisherId({ publisherId }: { publisherId?: string }) {
    if (!publisherId) return null
    return publisherId === UNCLAIMED_ADMIN_PUBLISHER_ID ? (
        <span className="text-gray">Unclaimed</span>
    ) : (
        <span>{`@${publisherId}`}</span>
    )
}
