// Builds "real" recommendations using TMDB:
// - Uses seed-based recommendations (/movie/{id}/recommendations or /tv/{id}/recommendations)
//   from items that the user has in watchlist/favorites/continue watching and are present in `content`.
// - Falls back to TMDB Discover with top genres inferred from the user's data.
// - Supports refresh via page rotation and a refreshToken.
// - Accepts either NEXT_PUBLIC_TMDB_API_KEY or NEXT_PUBLIC_TMDB_KEY.

import { useCallback, useEffect, useMemo, useState } from 'react';

const TMDB_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.NEXT_PUBLIC_TMDB_KEY ||
  '';

const TMDB_BASE = 'https://api.themoviedb.org/3';

function isTV(item) {
  return !!item?.first_air_date || (!!item?.name && !item?.title);
}
function isMovie(item) {
  return !!item?.release_date || (!!item?.title && !item?.name);
}

function uniqueById(items, limit = 20) {
  const seen = new Set();
  const out = [];
  for (const it of items) {
    if (!it || typeof it.id !== 'number') continue;
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
    if (out.length >= limit) break;
  }
  return out;
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useRecommendations({
  content = [],
  watchlistIds = [],
  watchedIds = [],
  pageMovies = 1,
  pageTV = 1,
  refreshToken = 0,
}) {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [recommendedTV, setRecommendedTV] = useState([]);
  const [loading, setLoading] = useState(false);

  const seedItems = useMemo(() => {
    const setIds = new Set([...(watchlistIds || []), ...(watchedIds || [])]);
    const seeds = (content || []).filter((c) => setIds.has(c?.id));
    const movies = seeds.filter(isMovie).slice(0, 3);
    const tv = seeds.filter(isTV).slice(0, 3);
    return { movies, tv };
  }, [content, watchlistIds, watchedIds]);

  const topGenres = useMemo(() => {
    const scores = new Map();
    const setIds = new Set([...(watchlistIds || []), ...(watchedIds || [])]);
    const pool = (content || []).filter(Boolean);
    const prioritized = pool.filter((c) => setIds.has(c.id));
    const fallback = pool;

    const bump = (items, weightBase = 2) => {
      items.forEach((item, idx) => {
        const weight = weightBase + Math.max(0, 5 - idx) * 0.2;
        const genreIds = item.genre_ids || item.genres?.map((g) => g.id) || [];
        genreIds.forEach((g) => scores.set(g, (scores.get(g) || 0) + weight));
      });
    };

    if (prioritized.length) bump(prioritized, 2.5);
    if (fallback.length) bump(fallback, 1);

    const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([g]) => g).filter(Boolean);
  }, [content, watchlistIds, watchedIds]);

  const buildDiscoverUrl = (type, page = 1) => {
    if (!TMDB_KEY) return '';
    const genreStr = topGenres.join(',');
    const withGenres = genreStr ? `&with_genres=${encodeURIComponent(genreStr)}` : '';
    return `${TMDB_BASE}/discover/${type}?api_key=${TMDB_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&page=${page}${withGenres}`;
  };

  const buildSeedRecsUrl = (type, id, page = 1) => {
    if (!TMDB_KEY || !id) return '';
    return `${TMDB_BASE}/${type}/${id}/recommendations?api_key=${TMDB_KEY}&language=en-US&page=${page}`;
  };

  const load = useCallback(async () => {
    if (!TMDB_KEY) {
      setRecommendedMovies([]);
      setRecommendedTV([]);
      return;
    }
    setLoading(true);

    const movieResults = [];
    for (const seed of seedItems.movies || []) {
      const url = buildSeedRecsUrl('movie', seed.id, pageMovies);
      if (!url) break;
      const data = await fetchJSON(url);
      if (data?.results?.length) movieResults.push(...data.results);
      if (movieResults.length >= 24) break;
    }
    if (movieResults.length < 12) {
      const url = buildDiscoverUrl('movie', pageMovies);
      if (url) {
        const data = await fetchJSON(url);
        if (data?.results?.length) movieResults.push(...data.results);
      }
    }

    const tvResults = [];
    for (const seed of seedItems.tv || []) {
      const url = buildSeedRecsUrl('tv', seed.id, pageTV);
      if (!url) break;
      const data = await fetchJSON(url);
      if (data?.results?.length) tvResults.push(...data.results);
      if (tvResults.length >= 24) break;
    }
    if (tvResults.length < 12) {
      const url = buildDiscoverUrl('tv', pageTV);
      if (url) {
        const data = await fetchJSON(url);
        if (data?.results?.length) tvResults.push(...data.results);
      }
    }

    setRecommendedMovies(uniqueById(movieResults, 18));
    setRecommendedTV(uniqueById(tvResults, 18));
    setLoading(false);
  }, [seedItems, pageMovies, pageTV, buildDiscoverUrl, buildSeedRecsUrl]);

  useEffect(() => {
    load();
  }, [load, refreshToken]);

  return {
    recommendedMovies,
    recommendedTV,
    loading,
    hasKey: !!TMDB_KEY,
  };
}