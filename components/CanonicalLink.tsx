import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { SITE_URL } from '../src/constants'

export const CanonicalLink: React.FC = () => {
  const router = useRouter()
  const localePrefix =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`

  // Clean up potential double slashes if SITE_URL happens to have a trailing slash
  const baseUrl = SITE_URL.replace(/\/$/, '')
  const canonicalUrl = `${baseUrl}${localePrefix}${router.pathname}`

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  )
}
