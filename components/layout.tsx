import Head from 'next/head'
import { ThemeModeScript } from 'flowbite-react'
import Header from './Header/Header'

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

            {/* <Header /> */}
            <main className=" h-auto lg:h-[calc(100vh-62px)] ">{children}</main>
        </>
    )
}
