import { useEffect, useState } from 'react'
import { useNextTranslation } from '@/src/hooks/i18n'

const STORAGE_KEY = 'comfy-registry-content-translation-mode'
type Mode = 'translated' | 'original'

interface ContentToggleProps {
  original: string
  translated: string | null
  locale: string
  isLoadingTranslation?: boolean
}

/**
 * Renders dynamic node content (description, etc.) with a toggle that lets
 * users switch between the auto-translated version and the original English.
 *
 * - When `locale === "en"` or no translation is available, falls back to
 *   the original and hides the toggle entirely.
 * - The user's preference is persisted in localStorage so toggling once
 *   sticks across navigations.
 * - Default mode is "translated" when a translation exists, so users on
 *   non-English locales get the localized text by default.
 */
export default function ContentToggle({
  original,
  translated,
  locale,
  isLoadingTranslation,
}: ContentToggleProps) {
  const { t } = useNextTranslation()
  const [mode, setMode] = useState<Mode>('translated')

  // Restore stored preference on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'original' || saved === 'translated') setMode(saved)
  }, [])

  const isNonEn = locale !== 'en'
  const hasTranslation = !!translated && isNonEn
  const showOriginal = !hasTranslation || mode === 'original'
  const displayed = showOriginal ? original : translated!
  // Show the header whenever we're on a non-en locale and either have a
  // translation to toggle to or are still fetching one. This makes the
  // "Translating…" indicator reachable while the async fetch is in flight.
  const showHeader = isNonEn && (hasTranslation || isLoadingTranslation)

  const toggle = () => {
    const next: Mode = mode === 'translated' ? 'original' : 'translated'
    setMode(next)
    if (typeof window !== 'undefined')
      window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <div>
      {showHeader && (
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-400">
          {hasTranslation && (
            <button
              type="button"
              onClick={toggle}
              className="rounded border border-gray-600 px-2 py-1 hover:border-blue-500 hover:text-blue-300"
            >
              {showOriginal ? t('Show translation') : t('Show original')}
            </button>
          )}
          {hasTranslation && !showOriginal && (
            <span
              title={t('Auto-translated by AI; original may be more accurate')}
            >
              {t('Auto-translated')}
            </span>
          )}
          {isLoadingTranslation && !translated && (
            <span className="italic">{t('Translating…')}</span>
          )}
        </div>
      )}
      <p className="text-base font-normal whitespace-pre-wrap text-gray-200">
        {displayed}
      </p>
    </div>
  )
}
