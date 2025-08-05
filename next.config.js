const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during Vercel build
  },
  images: {
    domains: [
      'image.tmdb.org',
      'images.unsplash.com',
      'via.placeholder.com',
      'i.scdn.co',
      'img.icons8.com'
    ],
  },
  reactStrictMode: true,
});
