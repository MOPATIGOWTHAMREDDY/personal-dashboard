import '../styles/globals.css';
import Script from 'next/script';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="CinemaStream Dashboard" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CinemaStream" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="https://img.icons8.com/?size=100&id=vktzxU8bOVMG&format=png&color=000000" />
        <link rel="shortcut icon" href="https://img.icons8.com/?size=100&id=vktzxU8bOVMG&format=png&color=000000" />
        
        {/* SEO */}
        <meta name="description" content="Ultimate streaming dashboard for movies, TV shows, anime with premium sources" />
        <meta property="og:title" content="CinemaStream - Premium Streaming" />
        <meta property="og:description" content="Stream movies, TV shows and anime with 20+ premium sources" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#000000" />
        
        {/* Preconnect to improve performance */}
        <link rel="preconnect" href="https://api.themoviedb.org" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://iframe.pstream.mov" />
        <link rel="dns-prefetch" href="https://vidlink.pro" />
        <link rel="dns-prefetch" href="https://vidsrc.xyz" />
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

      {/* Global Performance Optimizations */}
      <Script id="performance-optimizations" strategy="beforeInteractive">
        {`
          // Preload critical resources
          const preloadResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
          ];
          
          preloadResources.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = url;
            document.head.appendChild(link);
          });
        `}
      </Script>
      
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;