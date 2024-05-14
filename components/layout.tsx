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

export default function Layout({ children }: React.PropsWithChildren) {
    const router = useRouter()
    const isLoginPage = router.pathname === '/auth/login'
    const isSignupPage = router.pathname === '/auth/signup'
    const isReservedPath = /^\/(auth|api|_error|_app|_document)/.test(
        router.pathname
    )
    const auth = getAuth(app)
    const [user, error] = useAuthState(auth)

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
                    <Header isLoggedIn={!!user} title={'Your Nodes'} />
                )}
                <main>{children}</main>
            </Container>
            <ToastContainer />
        </>
    )
}
