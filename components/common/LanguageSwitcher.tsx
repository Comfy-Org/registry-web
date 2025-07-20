import { useNextTranslation } from '@/src/hooks/i18n'
import { SUPPORTED_LANGUAGES } from '@/src/constants'
import { Dropdown, DropdownItem } from 'flowbite-react'
import React, { useMemo, useEffect } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'

export default function LanguageSwitcher({
    className,
}: {
    className?: string
} = {}) {
    const { t, i18n, changeLanguage, currentLanguage } = useNextTranslation()
    const router = useRouter()

    // _document.tsx sets the initial direction based on locale,
    // here we update document direction by locale without reloading the page
    const dir = i18n.resolvedLanguage && i18n.dir(i18n.resolvedLanguage)
    useEffect(() => {
        if (dir) document.documentElement.dir = dir
    }, [dir])

    // Memoize display names to avoid recreating Intl.DisplayNames instances on every render
    const displayNames = useMemo(() => {
        const currentLangDisplayNames = new Intl.DisplayNames(
            [currentLanguage],
            {
                type: 'language',
            }
        )

        return SUPPORTED_LANGUAGES.reduce(
            (acc, langCode) => {
                const thatLangDisplayNames = new Intl.DisplayNames([langCode], {
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

    const currentLanguageLabel = useMemo(() => {
        return (
            new Intl.DisplayNames([currentLanguage], {
                type: 'language',
            }).of(currentLanguage) || 'Language'
        )
    }, [currentLanguage])

    return (
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
                            React.forwardRef(function LanguageLink(props, ref) {
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
                            }) as typeof Link
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
                                        (Beta)
                                    </span>
                                )}
                            </span>
                        ) : (
                            <>
                                <span
                                    className={clsx(
                                        'text-right border-r-2 border-gray-300  pr-2 '
                                    )}
                                >
                                    {nameInThatLanguage}
                                    {langCode === 'ar' && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Beta)
                                        </span>
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
        </Dropdown>
    )
}
