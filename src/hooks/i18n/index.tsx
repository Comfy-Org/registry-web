import i18next from 'i18next'
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector'
import i18nextResourcesToBackend from 'i18next-resources-to-backend'
import { useRouter } from 'next/router'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { initReactI18next, useTranslation } from 'react-i18next'
import { useLocalStorage } from 'react-use'
import useCookieValue from 'react-use-cookie'
import { useAsyncData } from 'use-async'
import { LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES } from '@/src/constants'

// Type definitions for Chrome's experimental Translator API
interface TranslatorAPI {
  create(options: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<TranslatorInstance>
}

interface TranslatorInstance {
  translateStreaming(text: string): AsyncIterable<string>
}

declare global {
  interface Window {
    Translator?: TranslatorAPI
  }
  var Translator: TranslatorAPI | undefined
}

const i18n = i18next
  .use(I18nextBrowserLanguageDetector)
  .use(
    i18nextResourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../../locales/${language}/${namespace}.json`)
    )
  )
  .use(initReactI18next)

i18n.init({
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

  react: {
    bindI18nStore: 'added', // notify react to rerender when a new key is added
  },

  // Support dynamic translation
  saveMissing: true,
  missingKeyNoValueFallbackToKey: true,
  missingKeyHandler: async (lngs, ns, key) => {
    const lng = i18next.language
    console.log(lngs, i18next.language, key)
    console.log(`Missing translation for key "${key}" in language "${lng}"`)

    // (Experimental) Try use browser Translator API to handle missing keys
    // If the Translator API is not available, just return the key
    if (typeof globalThis.Translator === 'undefined') return

    // Create a translator instance
    const Translator = globalThis.Translator as TranslatorAPI
    const translator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage: lng,
    }).catch(() => null)
    if (!translator) return

    // Translate the key
    let tr = ''
    for await (const chunk of translator.translateStreaming(key)) {
      tr += chunk
    }
    console.log(`Translated "${key}" to "${tr}" in language "${lng}"`)
    // add to i18next resources
    // how to trigger a re-render in components that use this key?
    i18next.addResource(lng, ns, key, tr)
    i18next.emit('added', lng, ns, key, tr)

    // TODO: use ChatGPT to handle missing keys if browser Translator API is not available
    //
  },
})

export const useDynamicTranslateEnabled = () => {
  const [enabled, setEnabled] = useLocalStorage(
    'DynamicTranslate',
    false // default disabled, click the globe icon to enable across the site
  )
  return { enabled, setEnabled }
}

export const useDynamicTranslate = () => {
  const { currentLanguage, t } = useNextTranslation('dynamic')

  // try experimental dynamic translation
  //
  // 2025-07-27 currently, only chrome 138+ supports the Translator API
  // cons:
  // 1. requires network access to the browser's translation service
  // 2. not able to use in server-side rendering
  // 3. not available in china
  //
  const [available, availableState] = useAsyncData(async () => {
    if (typeof globalThis.Translator === 'undefined') return null
    const Translator = globalThis.Translator as TranslatorAPI
    const translator = await Translator.create({
      sourceLanguage: 'en',
      targetLanguage: currentLanguage,
    }).catch(() => null)
    return translator
  })

  const { enabled, setEnabled } = useDynamicTranslateEnabled()
  const dt = useCallback(
    (key?: string) => {
      if (!key) return key
      if (!available) return key
      return enabled ? t(key) : key
    },
    [enabled, available, t]
  )

  return { available, enabled, setEnabled, dt }
}

/**
 * Custom hook for translations in the Comfy Registry
 * @param namespace - The namespace to use for translations (defaults to 'common')
 * @returns Translation function and other i18next utilities
 */
export function useNextTranslation(namespace = 'common') {
  // language is defined by the Next.js router locale
  const router = useRouter()
  const locale = router.locale || router.defaultLocale || 'en'

  if (i18next.language !== locale) {
    // Set the i18next language to the current locale if it differs
    i18next.changeLanguage(locale)
  }

  // Use a cookie to store the user's language preference, for server-side detection
  const [cookieLocale, setCookieLocale] = useCookieValue(
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
