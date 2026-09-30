import type { FeedbackThread } from '@/src/api/feedback.generated'
import { useNextTranslation } from '@/src/hooks/i18n'

export function UnresolvedFeedbackBadge({
  thread,
}: {
  thread?: FeedbackThread
}) {
  const { t } = useNextTranslation()
  if (!thread || thread.archived || thread.state === 'resolved') return null
  return (
    <span
      className="ph-no-capture inline-flex rounded-full border border-yellow-400 bg-yellow-300 px-2 py-0.5 text-xs font-semibold text-gray-900"
      data-private="true"
    >
      {t('Unresolved feedback')}
    </span>
  )
}
