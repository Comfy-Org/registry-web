import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import { SUPPORTED_LANGUAGES } from '@/src/constants'
import { useNextTranslation } from '@/src/hooks/i18n'
import { LocalizationContributeModal } from './LocalizationContributeModal'

export default function LanguageSwitcher({
  className,
}: {
  className?: string
} = {}) {
  const { t, i18n, changeLanguage, currentLanguage } = useNextTranslation()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listboxId = useId()

  // _document.tsx sets the initial direction based on locale,
  // here we update document direction by locale without reloading the page
  const dir = i18n.resolvedLanguage && i18n.dir(i18n.resolvedLanguage)
  useEffect(() => {
    if (dir) document.documentElement.dir = dir
  }, [dir])

  // Memoize display names to avoid recreating Intl.DisplayNames instances on every render
  const displayNames = useMemo(() => {
    const currentLangDisplayNames = new Intl.DisplayNames(currentLanguage, {
      type: 'language',
    })
    // Always include English names so users can search "chinese", "japanese", etc.
    // regardless of their current UI language
    const englishDisplayNames = new Intl.DisplayNames('en', {
      type: 'language',
    })

    return SUPPORTED_LANGUAGES.reduce(
      (acc, langCode) => {
        const thatLangDisplayNames = new Intl.DisplayNames(langCode, {
          type: 'language',
        })

        acc[langCode] = {
          nameInMyLanguage: currentLangDisplayNames.of(langCode),
          nameInThatLanguage: thatLangDisplayNames.of(langCode),
          nameInEnglish: englishDisplayNames.of(langCode),
        }
        return acc
      },
      {} as Record<
        string,
        {
          nameInMyLanguage?: string
          nameInThatLanguage?: string
          nameInEnglish?: string
        }
      >
    )
  }, [currentLanguage])

  const currentLanguageLabel = useMemo(
    () =>
      new Intl.DisplayNames(currentLanguage, {
        type: 'language',
      }).of(currentLanguage) || 'Language',
    [currentLanguage]
  )

  const filteredLanguages = useMemo(() => {
    if (!search.trim()) return SUPPORTED_LANGUAGES
    const q = search.toLowerCase()
    return SUPPORTED_LANGUAGES.filter((langCode) => {
      const { nameInMyLanguage, nameInThatLanguage, nameInEnglish } =
        displayNames[langCode]
      return (
        nameInMyLanguage?.toLowerCase().includes(q) ||
        nameInThatLanguage?.toLowerCase().includes(q) ||
        nameInEnglish?.toLowerCase().includes(q) ||
        langCode.toLowerCase().includes(q)
      )
    })
  }, [search, displayNames])

  // Stable per-option IDs for aria-activedescendant
  const optionIds = useMemo(
    () =>
      SUPPORTED_LANGUAGES.reduce(
        (acc, langCode) => {
          acc[langCode] = `${listboxId}-${langCode}`
          return acc
        },
        {} as Record<string, string>
      ),
    [listboxId]
  )

  const activeOptionId =
    activeIndex >= 0 && filteredLanguages[activeIndex]
      ? optionIds[filteredLanguages[activeIndex]]
      : undefined

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus management and state reset on open/close
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      searchRef.current?.focus()
      setActiveIndex(-1)
    } else {
      setSearch('')
      setActiveIndex(-1)
      // Restore focus to trigger when dropdown closes so keyboard users aren't stranded
      if (wasOpenRef.current) {
        triggerRef.current?.focus()
        wasOpenRef.current = false
      }
    }
  }, [open])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items =
        listRef.current.querySelectorAll<HTMLElement>("[role='option']")
      items[activeIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't intercept keys when dropdown is closed — let the trigger button handle them
    if (!open) return
    switch (e.key) {
      case 'Escape':
        setOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (filteredLanguages.length === 0) break
        setActiveIndex((i) => Math.min(i + 1, filteredLanguages.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        if (filteredLanguages.length === 0) break
        setActiveIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        // Skip if IME is composing (e.g. CJK input confirmation)
        if (e.nativeEvent.isComposing) break
        if (activeIndex >= 0 && filteredLanguages[activeIndex]) {
          changeLanguage(filteredLanguages[activeIndex])
          setOpen(false)
        }
        break
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        className={clsx('relative', className)}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t('Select language')}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          {currentLanguageLabel}
          <svg
            className={clsx(
              'h-3 w-3 transition-transform',
              open && 'rotate-180'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute end-0 z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
            {/* Search input */}
            <div className="border-b border-gray-200 p-2 dark:border-gray-600">
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-controls={listboxId}
                aria-expanded={open}
                aria-activedescendant={activeOptionId}
                aria-label={t('Search languages')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setActiveIndex(0)
                }}
                placeholder={t('Search languages')}
                className="w-full rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Language list */}
            <ul
              id={listboxId}
              ref={listRef}
              role="listbox"
              aria-label={t('Select language')}
              className="max-h-60 overflow-y-auto py-1"
            >
              {filteredLanguages.length === 0 ? (
                <li
                  role="option"
                  aria-disabled="true"
                  aria-selected={false}
                  className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400"
                >
                  {t('No results')}
                </li>
              ) : (
                filteredLanguages.map((langCode, idx) => {
                  const { nameInMyLanguage, nameInThatLanguage } =
                    displayNames[langCode]
                  const isCurrent = langCode === currentLanguage
                  const isActive = idx === activeIndex

                  return (
                    <li
                      key={langCode}
                      id={optionIds[langCode]}
                      role="option"
                      aria-selected={isCurrent}
                    >
                      <Link
                        href={router.asPath}
                        as={router.asPath}
                        locale={langCode}
                        replace
                        onClick={(e) => {
                          // Allow Ctrl/Cmd/Shift+click to open in new tab/window
                          if (
                            e.ctrlKey ||
                            e.metaKey ||
                            e.shiftKey ||
                            e.button !== 0
                          )
                            return
                          e.preventDefault()
                          changeLanguage(langCode)
                          setOpen(false)
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={clsx(
                          'grid w-full grid-cols-2 px-3 py-2 text-xs',
                          isCurrent
                            ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-200',
                          isActive &&
                            !isCurrent &&
                            'bg-gray-100 dark:bg-gray-600',
                          !isCurrent &&
                            !isActive &&
                            'hover:bg-gray-100 dark:hover:bg-gray-600'
                        )}
                      >
                        {isCurrent ? (
                          <span className="col-span-2 text-center">
                            {nameInThatLanguage}
                            {langCode === 'ar' && (
                              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                (Beta)
                              </span>
                            )}
                          </span>
                        ) : (
                          <>
                            <span
                              className={clsx('text-right', {
                                'border-r-2 border-gray-300 pr-2 dark:border-gray-500':
                                  i18n.dir(currentLanguage) === 'ltr',
                                'border-l-2 border-gray-300 pl-2 dark:border-gray-500':
                                  i18n.dir(currentLanguage) === 'rtl',
                              })}
                            >
                              {nameInThatLanguage}
                              {langCode === 'ar' && (
                                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                  (Beta)
                                </span>
                              )}
                            </span>
                            <span className="pl-2 text-left">
                              {nameInMyLanguage}
                            </span>
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })
              )}
            </ul>

            {/* Contribute footer */}
            <div className="border-t border-gray-200 p-1 dark:border-gray-600">
              <button
                type="button"
                onClick={() => {
                  setShowContributeModal(true)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-center rounded px-3 py-2 text-xs text-blue-400 hover:bg-gray-100 hover:text-blue-300 dark:hover:bg-gray-600"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t('Contribute')}
              </button>
            </div>
          </div>
        )}
      </div>

      <LocalizationContributeModal
        open={showContributeModal}
        onClose={() => setShowContributeModal(false)}
      />
    </>
  )
}
