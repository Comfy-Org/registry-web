import { Html, Head, Main, NextScript } from 'next/document'
import Document, { DocumentContext, DocumentInitialProps } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
        const initialProps = await Document.getInitialProps(ctx)
        return initialProps
    }

    render() {
        // Access locale from __NEXT_DATA__ which is available in Document context
        const locale = (this.props as any)?.__NEXT_DATA__?.locale || 'en'
        const isRTL = locale === 'ar'

        return (
            <Html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
                <Head />
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument