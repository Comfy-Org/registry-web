import { useNextTranslation } from '@/src/hooks/i18n'
import { Badge } from 'flowbite-react'
import { PublisherStatus } from 'src/api/generated'

const PublisherStatusBadge: React.FC<{ status?: PublisherStatus }> = ({
  status,
}) => {
  const { t } = useNextTranslation()
  if (status === PublisherStatus.PublisherStatusBanned) {
    return <Badge color="failure">{t('Banned')}</Badge>
  }

  return null
}

export default PublisherStatusBadge
