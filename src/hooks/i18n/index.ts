import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/src/constants'
import i18next from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import i18nextResourcesToBackend from 'i18next-resources-to-backend'
import { useRouter } from 'next/router'
import { initReactI18next, useTranslation } from 'react-i18next'
import reactUseCookie from 'react-use-cookie'

const i18n = i18next
  .use(I18nextBrowserLanguageDetector)
  .use(
    i18nextResourcesToBackend(
      (language, namespace) =>
        import(`@/public/locales/${language}/${namespace}.json`)
    )
  )
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    fallbackNS: 'common',

    // not needed for react as it escapes by default
    interpolation: { escapeValue: false },

    // use ssr-side detection in middleware
    detection: {
      order: ['htmlTag'],
      caches: [],
    },
  })

/**
 * Custom hook for translations in the Comfy Registry
 * @param namespace - The namespace to use for translations (defaults to 'common')
 * @returns Translation function and other i18next utilities
 */
export function useNextTranslation(namespace = 'common') {
  // language is defined by the Next.js router locale
  const router = useRouter()
  const locale = router.locale || router.defaultLocale || 'en'

  // Use a cookie to store the user's language preference
  const [cookieLocale, setCookieLocale] = reactUseCookie(
    LANGUAGE_STORAGE_KEY,
    ''
  )

  const { t, i18n, ready } = useTranslation(namespace, { lng: locale })

  return {
    t,
    i18n,
    ready,
    currentLanguage: locale,
    changeLanguage: (locale: string) => {
      // change display language directly with i18n
      i18n.changeLanguage(locale)
      // Also update cookie for server-side detection
      setCookieLocale(locale)
      // Update the URL with the new locale, preserving the current path and query
      // This will trigger a re-render with the new locale
      router.replace(
        {
          pathname: router.pathname,
          query: router.query,
          hash: router.asPath.split('#')[1] || '',
        },
        router.asPath,
        { shallow: true, locale }
      )
    },
  }
}
