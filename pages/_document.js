// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script';          // ← use Next.js <Script> for correct loading

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Load Puter.js before React hydrates */}
          <Script
            src="https://js.puter.com/v2/"
            strategy="beforeInteractive"
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
