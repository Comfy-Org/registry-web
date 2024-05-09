import Head from 'next/head';
import { ThemeModeScript } from 'flowbite-react';
import { useRouter } from 'next/router';
import Header from './Header/Header';
import Container from './common/Container';

export default function Layout({ children }: React.PropsWithChildren) {
    const router = useRouter();
    const isLoginPage = router.pathname === '/auth/login';
    const isSignupPage = router.pathname === '/auth/signup';
    const isReservedPath = /^\/(auth|api|_error|_app|_document)/.test(router.pathname);
    
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
                {!(isLoginPage || isSignupPage || isReservedPath) && (
                    <Header isLoggedIn={false} title={'Your Nodes'} />
                )}
                <main>{children}</main>
            </Container>
        </>
    );
}
