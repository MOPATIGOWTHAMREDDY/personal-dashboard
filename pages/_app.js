import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import Head from 'next/head';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Personal Dashboard" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Dashboard" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons using external URLs */}
        <link rel="icon" href="https://img.icons8.com/?size=100&id=vktzxU8bOVMG&format=png&color=000000" />
        <link rel="apple-touch-icon" href="https://img.icons8.com/?size=100&id=uoRwwh0lz3Jp&format=png&color=000000" />
        <link rel="shortcut icon" href="https://img.icons8.com/?size=100&id=vktzxU8bOVMG&format=png&color=000000" />
        
        {/* SEO */}
        <meta name="description" content="Your personal entertainment dashboard for movies, music, news and more" />
        <meta property="og:title" content="Personal Dashboard" />
        <meta property="og:description" content="Entertainment hub for movies, music, news and more" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#000000" />
        
        {/* iPhone 15 Optimizations */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </Head>

      {/* Service Worker for PWA */}
      <Script id="sw-register" strategy="afterInteractive">
        {`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                  console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                  console.log('SW registration failed: ', registrationError);
                });
            });
          }
        `}
      </Script>
      
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;
