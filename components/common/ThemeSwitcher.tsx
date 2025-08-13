import React from 'react'
import { Dropdown, DropdownItem } from 'flowbite-react'
import { useTheme, Theme } from '@/src/hooks/useTheme'
import { useNextTranslation } from '@/src/hooks/i18n'
import { HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi'

const ThemeIcon = ({
    theme,
    actualTheme,
}: {
    theme: Theme
    actualTheme: 'light' | 'dark'
}) => {
    if (theme === 'auto') {
        return <HiDesktopComputer className="w-4 h-4" />
    }
    if (theme === 'light') {
        return <HiSun className="w-4 h-4" />
    }
    return <HiMoon className="w-4 h-4" />
}

export default function ThemeSwitcher() {
    const { theme, actualTheme, setTheme } = useTheme()
    const { t } = useNextTranslation()

    const themeOptions: {
        value: Theme
        label: string
        icon: React.ReactNode
    }[] = [
        {
            value: 'auto',
            label: t('Auto'),
            icon: <HiDesktopComputer className="w-4 h-4" />,
        },
        {
            value: 'light',
            label: t('Light'),
            icon: <HiSun className="w-4 h-4" />,
        },
        {
            value: 'dark',
            label: t('Dark'),
            icon: <HiMoon className="w-4 h-4" />,
        },
    ]

    const currentOption = themeOptions.find((option) => option.value === theme)

    return (
        <Dropdown
            label=""
            renderTrigger={() => (
                <button
                    type="button"
                    className="inline-flex items-center justify-center p-2 w-8 h-8 text-sm text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                    aria-label="Toggle theme"
                >
                    <ThemeIcon theme={theme} actualTheme={actualTheme} />
                </button>
            )}
            color="gray"
            size="xs"
            dismissOnClick
        >
            {themeOptions.map((option) => (
                <DropdownItem
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center gap-2 ${theme === option.value ? 'font-bold' : ''}`}
                >
                    {option.icon}
                    {option.label}
                </DropdownItem>
            ))}
        </Dropdown>
    )
}
