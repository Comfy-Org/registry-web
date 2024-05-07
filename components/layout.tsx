import Head from 'next/head'
import { ThemeModeScript } from 'flowbite-react'
import { useRouter } from 'next/router'
import Header from './Header/Header'
import Container from './common/Container'

export default function Layout({ children }: React.PropsWithChildren) {
    const router = useRouter()
    const isLoginPage = router.pathname === '/auth/login'

    return (
        <>
            <Head>
                <title>ComfyUI CI/CD</title>
                <meta
                    name="description"
                    content="ComfyUI CI/CD Dashboard for running workflows."
                />
                <ThemeModeScript />
            </Head>
            <Container>
                {!isLoginPage && <Header />}
                <main>{children}</main>
            </Container>
        </>
    )
}
