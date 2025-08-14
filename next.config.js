/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Custom headers
  async headers() {
    return [
      // 1) Base security headers for ALL routes (no X-Frame-Options here)
      {
        source: '/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, nosnippet, noarchive, noimageindex' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // 2) Only for PAGES (exclude API) add X-Frame-Options: SAMEORIGIN
      // This avoids breaking /api/proxy responses inside iframes.
      {
        source: '/((?!api/).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },

  // Proxy external requests (optional; ensure your client adds needed query params like api_key)
  async rewrites() {
    return [
      // Proxy TMDB API requests
      {
        source: '/api/tmdb/:path*',
        destination: 'https://api.themoviedb.org/3/:path*',
      },
      // Proxy image requests
      {
        source: '/api/images/:path*',
        destination: 'https://image.tmdb.org/t/p/:path*',
      },
      // Proxy GoodPlayer
      {
        source: '/api/player/:path*',
        destination: 'https://goodplayer.netlify.app/:path*',
      },
    ];
  },

  // Image optimization settings
  images: {
    unoptimized: true,
    domains: [
      'image.tmdb.org',
      // News sources
      'sportshub.cbsistatic.com',
      'nypost.com',
      'images.wsj.net',
      'cdn.cnn.com',
      'static01.nyt.com',
      'www.washingtonpost.com',
      'media.cnn.com',
      'cloudfront-us-east-1.images.arcpublishing.com',
      // Placeholder and fallback images
      'via.placeholder.com',
      'images.unsplash.com',
      'picsum.photos',
      'icons8.com',
      'img.icons8.com',
      's.yimg.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.tmdb.org' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.placeholder.com' },
      { protocol: 'https', hostname: '**.cbsistatic.com' },
      { protocol: 'https', hostname: '**.nypost.com' },
      { protocol: 'https', hostname: '**.wsj.net' },
      { protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' },
    ],
  },

  trailingSlash: false,
};

module.exports = nextConfig;