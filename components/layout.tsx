import Head from 'next/head'
import { ThemeModeScript } from 'flowbite-react'
import Header from './Header/Header'
import Container from './common/Container'

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <>
            <Head>
                <title>ComfyUI CI/CD</title>
                <meta
                    name="description"
                    content="ComfyUI CI/CD Dashboard for running workflows."
                ></meta>

                <ThemeModeScript />
            </Head>
            <Container>
                <Header />
                <main className="">{children}</main>
            </Container>
        </>
    )
}
