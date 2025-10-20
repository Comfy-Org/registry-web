import clsx from 'clsx'
import { Dropdown, DropdownItem } from 'flowbite-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useMemo, useState } from 'react'
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
    const [showContributeModal, setShowContributeModal] = useState(false)

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

        return SUPPORTED_LANGUAGES.reduce(
            (acc, langCode) => {
                const thatLangDisplayNames = new Intl.DisplayNames(langCode, {
                    type: 'language',
                })

                acc[langCode] = {
                    nameInMyLanguage: currentLangDisplayNames.of(langCode),
                    nameInThatLanguage: thatLangDisplayNames.of(langCode),
                }
                return acc
            },
            {} as Record<
                string,
                { nameInMyLanguage?: string; nameInThatLanguage?: string }
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

    return (
        <>
            <Dropdown
                label={currentLanguageLabel}
                color="gray"
                size="xs"
                dismissOnClick
            >
                {SUPPORTED_LANGUAGES.map((langCode) => {
                    const { nameInMyLanguage, nameInThatLanguage } =
                        displayNames[langCode]
                    const isCurrent = langCode === currentLanguage
                    return (
                        <DropdownItem
                            key={langCode}
                            className={clsx('grid grid-cols-2', {
                                'font-bold': isCurrent,
                            })}
                            as={
                                // forwardRef for allowing navigate using arrow-keys
                                React.forwardRef(
                                    function LanguageLink(props, ref) {
                                        return (
                                            <Link
                                                {...props}
                                                ref={
                                                    ref as React.Ref<HTMLAnchorElement>
                                                }
                                                onClick={(e) => {
                                                    // we need to use changeLanguage() to persist the language change
                                                    // and also update the cookie for server-side detection
                                                    e.preventDefault()
                                                    changeLanguage(langCode)
                                                }}
                                                locale={langCode}
                                                href={router.asPath}
                                                as={router.asPath}
                                                replace
                                            >
                                                {props.children}
                                            </Link>
                                        )
                                    }
                                ) as typeof Link
                            }
                        >
                            {isCurrent ? (
                                <span
                                    className={clsx('text-center col-span-2', {
                                        'font-bold': isCurrent,
                                    })}
                                >
                                    {nameInThatLanguage}
                                    {langCode === 'ar' && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            ({t('Beta', 'Beta')})
                                        </span>
                                    )}
                                </span>
                            ) : (
                                <>
                                    <span
                                        className={clsx(
                                            'text-right border-gray-300',
                                            {
                                                'border-r-2 pr-2':
                                                    i18n.dir(
                                                        currentLanguage
                                                    ) === 'ltr',
                                                'border-l-2 pl-2':
                                                    i18n.dir(
                                                        currentLanguage
                                                    ) === 'rtl',
                                            }
                                        )}
                                    >
                                        {nameInThatLanguage}
                                        {langCode === 'ar' && (
                                            <span className="ml-1 text-xs text-gray-500">{`(${t('Beta', 'Beta')})`}</span>
                                        )}
                                    </span>

                                    <span className={clsx('text-left pl-2')}>
                                        {nameInMyLanguage}
                                    </span>
                                </>
                            )}
                        </DropdownItem>
                    )
                })}
                <DropdownItem
                    className="border-t border-gray-600 mt-2 pt-2"
                    onClick={() => setShowContributeModal(true)}
                >
                    <div className="flex items-center justify-center text-blue-400 hover:text-blue-300">
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        {t('Contribute')}
                    </div>
                </DropdownItem>
            </Dropdown>
            <LocalizationContributeModal
                open={showContributeModal}
                onClose={() => setShowContributeModal(false)}
            />
        </>
    )
}
