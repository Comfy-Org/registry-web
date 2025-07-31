import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'

export type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
    theme: Theme
    actualTheme: 'light' | 'dark'
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'comfy-registry-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('auto')
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('dark')

    // Get system preference
    const getSystemTheme = (): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'dark'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
    }

    // Calculate actual theme based on setting
    const calculateActualTheme = (themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'auto') {
            return getSystemTheme()
        }
        return themeValue
    }

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme
        const initialTheme = savedTheme || 'auto'
        setThemeState(initialTheme)
        setActualTheme(calculateActualTheme(initialTheme))
    }, [calculateActualTheme])

    // Listen to system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
            if (theme === 'auto') {
                setActualTheme(getSystemTheme())
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [theme])

    // Update document class and actual theme when theme changes
    useEffect(() => {
        const newActualTheme = calculateActualTheme(theme)
        setActualTheme(newActualTheme)

        if (typeof document !== 'undefined') {
            document.documentElement.classList.remove('light', 'dark')
            document.documentElement.classList.add(newActualTheme)
        }
    }, [theme])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, actualTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
