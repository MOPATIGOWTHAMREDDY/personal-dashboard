import Head from 'next/head';
import { useEffect } from 'react';

export default function StealthLayout({ children, title = "Private App" }) {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Console warning
    console.clear();
    console.warn('🔒 This is a private application. Unauthorized access is prohibited.');

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow, nosnippet, noarchive, noimageindex" />
        <meta name="googlebot" content="noindex, nofollow, nosnippet, noarchive, noimageindex" />
        <meta name="bingbot" content="noindex, nofollow, nosnippet, noarchive, noimageindex" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
        <meta property="og:title" content="" />
        <meta property="og:description" content="" />
        <meta property="og:image" content="" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="" />
        <meta name="twitter:description" content="" />
        
        {/* Disable caching */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Fake favicon to avoid 404s */}
        <link rel="icon" href="data:," />
        
        {/* Remove generator meta */}
        <meta name="generator" content="" />
      </Head>
      
      <div className="stealth-app">
        {children}
      </div>

      <style jsx global>{`
        /* Hide scrollbars for extra stealth */
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        /* Disable text selection */
        .stealth-app {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Disable drag */
        img, video {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </>
  );
}
