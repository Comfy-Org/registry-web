import Head from 'next/head'
import { ThemeModeScript } from 'flowbite-react'
import Header from './Header/Header'
import Container from './common/Container'

export default function Layout({ children }: React.PropsWithChildren) {
    return (
        <>
            <Head>
                <title>ComfyUI Registry</title>
                <meta
                    name="description"
                    content="ComfyUI Registry for publishing custom nodes."
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
