import { useNextTranslation } from '@/src/hooks/i18n'

export function InstallationTags({ tags }: { tags?: string[] }) {
  const { t } = useNextTranslation()
  if (!tags) return null
  return (
    <section
      className="my-4 space-y-2 rounded border border-gray-700 p-3"
      aria-label={t('Public installation tags')}
    >
      <h3 className="font-semibold">
        {t('Installation tags')}{' '}
        <span className="text-xs font-normal text-blue-200">{t('Public')}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.length ? (
          tags.map((tag) => (
            <span
              key={tag}
              className="break-all rounded bg-gray-700 px-2 py-1 text-xs"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400">
            {t('No installation tags')}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400">
        {t(
          'Public information for installation decisions and Manager installation policies.'
        )}
      </p>
    </section>
  )
}
