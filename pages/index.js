import React, { useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Monitor, Sparkles, Film, Tv, Gamepad2 } from 'lucide-react';

// Dynamically import components for better performance
const MediaHub = dynamic(() => import('../components/MediaHub'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin animation-delay-1000 mx-auto"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading CinemaStream</h2>
        <p className="text-gray-400">Preparing your premium streaming experience...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for better performance with localStorage
});

// Optional: Keep your existing Layout for other pages
const Layout = dynamic(() => import('../components/Layout'), { 
  ssr: false 
});

export default function Home({ initialMovies, initialNews, useNewDesign = true }) {
  const [showClassicDashboard, setShowClassicDashboard] = useState(!useNewDesign);

  return (
    <>
      <Head>
        <title>CinemaStream - Premium Movie & TV Streaming Hub</title>
        <meta name="description" content="Stream movies, TV shows, and anime with 20+ premium sources. No ads, no limits, just entertainment." />
        <meta property="og:title" content="CinemaStream - Premium Streaming Hub" />
        <meta property="og:description" content="Ultimate streaming platform with movies, TV shows, anime and premium sources" />
        <meta property="og:image" content="/cinema-og.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CinemaStream - Premium Streaming" />
        <meta name="twitter:description" content="Stream unlimited movies, TV shows & anime with premium quality" />
        
        {/* Additional SEO */}
        <meta name="keywords" content="streaming, movies, tv shows, anime, online streaming, watch movies, free streaming, cinema, entertainment" />
        <meta name="author" content="CinemaStream" />
        <meta name="robots" content="index, follow" />
        
        {/* Apple-specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CinemaStream" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CinemaStream",
              "description": "Premium streaming platform for movies, TV shows, and anime",
              "url": "https://your-domain.com",
              "applicationCategory": "Entertainment",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "20+ Premium Sources",
                "Movies & TV Shows",
                "Anime Streaming",
                "No Ads",
                "HD Quality"
              ]
            })
          }}
        />
      </Head>

      {/* App Switcher: show here only when Classic is visible.
          When MediaHub (Cinema) is visible, MediaHub will render the same toggle itself. */}
      {showClassicDashboard && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-2">
            <button
              onClick={() => setShowClassicDashboard(!showClassicDashboard)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                showClassicDashboard
                  ? 'bg-white/20 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
              }`}
              title={showClassicDashboard ? 'Switch to CinemaStream' : 'Switch to Classic Dashboard'}
              type="button"
            >
              {showClassicDashboard ? (
                <div className="flex items-center space-x-2">
                  <Sparkles size={20} />
                  <span className="hidden sm:inline text-sm font-medium">Cinema</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Monitor size={20} />
                  <span className="hidden sm:inline text-sm font-medium">Classic</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats Banner (Optional) */}
      {!showClassicDashboard && (
        <div className="fixed bottom-4 left-4 z-40 hidden lg:block">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Live</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <Film size={16} />
                <span>Movies</span>
              </div>
              <div className="flex items-center space-x-2 text-green-400">
                <Tv size={16} />
                <span>TV Shows</span>
              </div>
              <div className="flex items-center space-x-2 text-pink-400">
                <Gamepad2 size={16} />
                <span>Anime</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showClassicDashboard ? (
        <Layout initialMovies={initialMovies} initialNews={initialNews} />
      ) : (
        <MediaHub
          showClassicDashboard={showClassicDashboard}
          onToggleView={(next) => setShowClassicDashboard(next)}
        />
      )}

      {/* Performance Monitoring (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('🚀 Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
                console.log('🎬 CinemaStream Ready');
              });
            `
          }}
        />
      )}
    </>
  );
}

// Enhanced Static Site Generation with caching
export async function getStaticProps() {
  let initialMovies = [];
  let initialNews = [];

  try {
    const moviesController = new AbortController();
    const moviesTimeout = setTimeout(() => moviesController.abort(), 10000);

    const moviesRes = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`,
      { 
        signal: moviesController.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CinemaStream/1.0'
        }
      }
    );
    
    clearTimeout(moviesTimeout);
    
    if (moviesRes.ok) {
      const moviesData = await moviesRes.json();
      initialMovies = moviesData.results || [];
    }
  } catch (error) {
    console.error('Error fetching movies:', error.name === 'AbortError' ? 'Request timeout' : error.message);
  }

  try {
    const newsController = new AbortController();
    const newsTimeout = setTimeout(() => newsController.abort(), 8000);

    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=entertainment&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`,
      { 
        signal: newsController.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CinemaStream/1.0'
        }
      }
    );
    
    clearTimeout(newsTimeout);
    
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      initialNews = newsData.articles || [];
    }
  } catch (error) {
    console.error('Error fetching news:', error.name === 'AbortError' ? 'Request timeout' : error.message);
  }

  return {
    props: {
      initialMovies: initialMovies.slice(0, 12),
      initialNews: initialNews.slice(0, 8),
      useNewDesign: true,
      timestamp: new Date().toISOString(),
    },
    revalidate: 1800
  };
}