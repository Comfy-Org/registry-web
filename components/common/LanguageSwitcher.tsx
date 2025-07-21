import { useNextTranslation } from '@/src/hooks/i18n'
import { SUPPORTED_LANGUAGES } from '@/src/constants'
import { Dropdown, DropdownItem } from 'flowbite-react'
import React from 'react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface LanguageSwitcherProps {
    className?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className }) => {
    const { t, changeLanguage, currentLanguage } = useNextTranslation()
    const router = useRouter()
    return (
        <Dropdown
            label={
                new Intl.DisplayNames([currentLanguage], {
                    type: 'language',
                }).of(currentLanguage) || 'Language'
            }
            color="gray"
            size="xs"
        >
            {SUPPORTED_LANGUAGES.map((langCode) => {
                const nameInMyLanguage = new Intl.DisplayNames(
                    [currentLanguage],
                    { type: 'language' }
                ).of(langCode)
                const nameInTheLanguage = new Intl.DisplayNames([langCode], {
                    type: 'language',
                }).of(langCode)
                const isCurrent = langCode === currentLanguage
                return (
                    <DropdownItem
                        key={langCode}
                        className={clsx('grid grid-cols-2 gap-4', {
                            'font-bold': isCurrent,
                        })}
                        onClick={() => {
                            changeLanguage(langCode)
                        }}
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
