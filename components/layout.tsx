import mixpanel from 'mixpanel-browser'
import React from 'react'
import Head from 'next/head'
import { getAuth } from 'firebase/auth'
import { ThemeModeScript } from 'flowbite-react'
import { useRouter } from 'next/router'
import Header from './Header/Header'
import Container from './common/Container'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { useAuthState } from 'react-firebase-hooks/auth'
import app from 'src/firebase'

mixpanel.init('f919d1b9da9a57482453c72ef7b16d88', {
    debug: true,
    track_pageview: true,
    persistence: 'localStorage',
})

export default function Layout({ children }: React.PropsWithChildren) {
    const router = useRouter()
    const isLoginPage = router.pathname === '/auth/login'
    const isSignupPage = router.pathname === '/auth/signup'
    const isReservedPath = /^\/(auth|api|_error|_app|_document)/.test(
        router.pathname
    )
    const auth = getAuth(app)
    const [user, loading, error] = useAuthState(auth)

    React.useEffect(() => {
        if (user) {
            mixpanel.identify(user.uid)
            mixpanel.people.set({
                $email: user.email,
                $name: user.displayName,
            })
        }
    }, [user])

    return (
        <>
            <Head>
                <title>ComfyUI Registry</title>
                <meta
                    name="description"
                    content="ComfyUI CI/CD Dashboard for running workflows."
                />
                <ThemeModeScript />
            </Head>
            <Container>
                {!(isLoginPage || isSignupPage || isReservedPath) && (
                    <Header
                        isLoggedIn={loading || !!user}
                        title={'Your Nodes'}
                    />
                )}
                <main>{children}</main>
            </Container>
            <ToastContainer />
        </>
    )
}
