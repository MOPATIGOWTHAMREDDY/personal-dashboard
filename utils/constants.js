// No changes needed - this file doesn't import anything
export const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
  ANIME: 'anime'
};

export const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
  10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News', 10764: 'Reality',
  10765: 'Sci-Fi & Fantasy', 10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

export const CONTENT_CONFIGS = [
  { 
    id: CONTENT_TYPES.MOVIE, 
    name: 'Movies', 
    icon: '🎬', 
    color: 'blue',
    gradient: 'from-blue-600 to-cyan-600',
    categories: [
      { id: 'popular', name: 'Popular', icon: '🔥' },
      { id: 'top_rated', name: 'Top Rated', icon: '⭐' },
      { id: 'upcoming', name: 'Upcoming', icon: '🚀' },
      { id: 'now_playing', name: 'Now Playing', icon: '▶️' }
    ]
  },
  { 
    id: CONTENT_TYPES.TV, 
    name: 'TV Shows', 
    icon: '📺', 
    color: 'green',
    gradient: 'from-green-600 to-emerald-600',
    categories: [
      { id: 'popular', name: 'Popular', icon: '🔥' },
      { id: 'top_rated', name: 'Top Rated', icon: '⭐' },
      { id: 'on_the_air', name: 'On Air', icon: '📡' },
      { id: 'airing_today', name: 'Airing Today', icon: '🆕' }
    ]
  },
  { 
    id: CONTENT_TYPES.ANIME, 
    name: 'Anime', 
    icon: '🎌', 
    color: 'pink',
    gradient: 'from-pink-600 to-rose-600',
    categories: [
      { id: 'popular', name: 'Popular', icon: '🔥' },
      { id: 'top_rated', name: 'Top Rated', icon: '⭐' },
      { id: 'on_the_air', name: 'Ongoing', icon: '📡' },
      { id: 'airing_today', name: 'New Episodes', icon: '🆕' }
    ]
  }
];