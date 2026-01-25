import i18next from "i18next";
import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    // Access locale from __NEXT_DATA__ which is available in Document context
    const locale = (this.props as any)?.__NEXT_DATA__?.locale || "en";
    const dir = i18next.dir(locale);

    return (
      <Html lang={locale} dir={dir}>
        <Head>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-1BJGRF43F4"
          ></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-1BJGRF43F4');
              `,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
