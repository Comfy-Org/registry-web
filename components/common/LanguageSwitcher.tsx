import { useNextTranslation } from '@/src/hooks/i18n'
import { LANGUAGE_NAMES } from '@/src/constants'
import { Dropdown } from 'flowbite-react'
import React, { useEffect } from 'react'

export default function LanguageSwitcher({
    className,
}: {
    className?: string
}) {
    const { i18n, changeLanguage, currentLanguage } = useNextTranslation()

    // _document.tsx sets the initial direction based on locale,
    // here we update document direction by locale without reloading the page
    const dir = i18n.resolvedLanguage && i18n.dir(i18n.resolvedLanguage)
    useEffect(() => {
        if (dir) document.documentElement.dir = dir
    }, [dir])

    return (
        <Dropdown
            label={LANGUAGE_NAMES[currentLanguage] || 'Language'}
            color="gray"
            className={className}
            size="xs"
        >
            {Object.entries(LANGUAGE_NAMES).map(([langCode, langName]) => (
                <Dropdown.Item
                    key={langCode}
                    onClick={() => changeLanguage(langCode)}
                    className={currentLanguage === langCode ? 'font-bold' : ''}
                >
                    {langName}
                    {langCode === 'ar' && (
                        <span className="ml-1 text-xs text-gray-500">
                            (Beta)
                        </span>
                    )}
                </Dropdown.Item>
            ))}
        </Dropdown>
    )
}
