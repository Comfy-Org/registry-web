import { useNextTranslation } from '@/src/hooks/i18n'
import { SUPPORTED_LANGUAGES } from '@/src/constants'
import { Dropdown, DropdownItem } from 'flowbite-react'
import React, { useMemo } from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface LanguageSwitcherProps {
    className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { t, changeLanguage, currentLanguage } = useNextTranslation()
    const router = useRouter()

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
                const nativeLangDisplayNames = new Intl.DisplayNames(
                    [langCode],
                    {
                        type: 'language',
                    }
                )

                acc[langCode] = {
                    nameInMyLanguage: currentLangDisplayNames.of(langCode),
                    nameInTheLanguage: nativeLangDisplayNames.of(langCode),
                }
                return acc
            },
            {} as Record<
                string,
                { nameInMyLanguage?: string; nameInTheLanguage?: string }
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
        <Dropdown label={currentLanguageLabel} color="gray" size="xs">
            {SUPPORTED_LANGUAGES.map((langCode) => {
                const { nameInMyLanguage, nameInTheLanguage } =
                    displayNames[langCode]
                const isCurrent = langCode === currentLanguage
                return (
                    <DropdownItem
                        key={langCode}
                        className={clsx('grid grid-cols-2 gap-4', {
                            'font-bold': isCurrent,
                        })}
                        as={Link}
                        itemProp=""
                        locale={langCode}
                        href={router.asPath}
                    >
                        {nameInTheLanguage === nameInMyLanguage ? (
                            <span
                                className={clsx('text-center col-span-2', {
                                    'font-bold': isCurrent,
                                })}
                            >
                                {nameInTheLanguage}
                            </span>
                        ) : (
                            <>
                                <span className={clsx('text-right')}>
                                    {nameInTheLanguage}
                                </span>
                                <span className={clsx('text-left')}>
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

export default LanguageSwitcher
