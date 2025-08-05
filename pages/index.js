import Layout from '../components/Layout';
import Head from 'next/head';

export default function Home({ initialMovies, initialNews }) {
  return (
    <>
      <Head>
        <title>Personal Dashboard - Entertainment Hub</title>
        <meta name="description" content="Movies, Music, News and more in one iOS-style dashboard" />
        <meta property="og:title" content="Personal Dashboard" />
        <meta property="og:description" content="Your entertainment hub for movies, music, news and more" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Layout initialMovies={initialMovies} initialNews={initialNews} />
    </>
  );
}

// Pre-render with real data
export async function getStaticProps() {
  let initialMovies = [];
  let initialNews = [];

  try {
    // Fetch trending movies
    const moviesRes = await fetch(
      `https://api.themoviedb.org/3/trending/movie/day?api_key=${process.env.NEXT_PUBLIC_TMDB_KEY}`
    );
    const moviesData = await moviesRes.json();
    initialMovies = moviesData.results || [];
  } catch (error) {
    console.error('Error fetching movies:', error);
  }

  try {
    // Fetch latest news
    const newsRes = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=entertainment&apiKey=${process.env.NEXT_PUBLIC_NEWS_KEY}`
    );
    const newsData = await newsRes.json();
    initialNews = newsData.articles || [];
  } catch (error) {
    console.error('Error fetching news:', error);
  }

  return {
    props: {
      initialMovies: initialMovies.slice(0, 10), // Only first 10 for performance
      initialNews: initialNews.slice(0, 5)       // Only first 5
    },
    revalidate: 3600 // Revalidate every hour
  };
}
