import { getAuth } from 'firebase/auth'
import { ThemeModeScript } from 'flowbite-react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import analytic from 'src/analytic/analytic'
import app from 'src/firebase'
import Header from './Header/Header'
import Container from './common/Container'

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
            analytic.identify(user.uid)
            analytic.setProfile({
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
                    content="Discover and install ComfyUI custom nodes."
                />
                <link rel="icon" href="/favicon.ico" />
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
