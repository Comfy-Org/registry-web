import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import SignIn from '../../components/AuthUI/AuthUI'
import { SITE_URL } from '../../src/constants'

const SignUpPage: React.FC = () => {
  const router = useRouter()
  const localePrefix =
    router.locale === router.defaultLocale ? '' : `/${router.locale}`
  const canonicalUrl = `${SITE_URL}${localePrefix}${router.pathname}`

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
      </Head>
      <SignIn />
    </>
  )
}
export default SignUpPage
