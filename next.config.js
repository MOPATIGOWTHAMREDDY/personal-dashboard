/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      // Movie images
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
      
      // Add more domains as needed
    ],
    // Optional: Allow external patterns for more flexibility
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.placeholder.com',
      },
      // News sources patterns
      {
        protocol: 'https',
        hostname: '**.cbsistatic.com',
      },
      {
        protocol: 'https',
        hostname: '**.nypost.com',
      },
      {
        protocol: 'https',
        hostname: '**.wsj.net',
      },
    ]
  }
}

module.exports = nextConfig