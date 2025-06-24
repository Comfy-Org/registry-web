import { UNCLAIMED_ADMIN_PUBLISHER_ID } from '@/src/constants'
import { useNextTranslation } from '@/src/hooks/i18n'

export function PublisherId({ publisherId }: { publisherId?: string }) {
    const { t } = useNextTranslation()
    if (!publisherId) return null
    return publisherId === UNCLAIMED_ADMIN_PUBLISHER_ID ? (
        <span className="text-gray">{t('Unclaimed')}</span>
    ) : (
        <span>{`@${publisherId}`}</span>
    )
}
