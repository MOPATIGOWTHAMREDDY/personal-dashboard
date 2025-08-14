// Lightweight client-side "new episode" detector for shows in Continue Watching.
// Uses TMDB v3 API by default (NEXT_PUBLIC_TMDB_API_KEY). Caches each show's
// response in sessionStorage for 6 hours to reduce API calls.
//
// Returns:
// - alerts: { [tmdbId]: { hasNew: boolean, next?: { season, episode, air_date, name } } }
// - totalNew: number of shows with new episodes
// - loading: boolean
//
// Notes:
// - We infer a TV item if it has season/episode fields (from your Continue Watching entry).
// - If TMDB key is missing, alerts gracefully remain empty.

import { useEffect, useMemo, useState } from 'react';

const TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function getCache(id) {
  try {
    const raw = sessionStorage.getItem(`cinemastream_alerts_tv_${id}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - (data?.ts || 0) > TTL_MS) return null;
    return data?.payload || null;
  } catch {
    return null;
  }
}

function setCache(id, payload) {
  try {
    sessionStorage.setItem(
      `cinemastream_alerts_tv_${id}`,
      JSON.stringify({ ts: Date.now(), payload })
    );
  } catch {}
}

export function useEpisodeAlerts(continueWatching = []) {
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(false);

  const tvItems = useMemo(() => {
    return continueWatching.filter(
      (i) => i && typeof i.id === 'number' && (i.season != null && i.episode != null)
    );
  }, [continueWatching]);

  useEffect(() => {
    let aborted = false;
    const API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.NEXT_PUBLIC_TMDB_KEY ||
  '';

    async function fetchShow(id) {
      const cached = getCache(id);
      if (cached) return cached;

      if (!API_KEY) return null;
      try {
        const url = `https://api.themoviedb.org/3/tv/${id}?language=en-US&api_key=${API_KEY}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) return null;
        const data = await res.json();
        setCache(id, data);
        return data;
      } catch {
        return null;
      }
    }

    async function run() {
      if (!tvItems.length) {
        setAlerts({});
        return;
      }
      setLoading(true);
      const result = {};

      for (const item of tvItems) {
        const meta = await fetchShow(item.id);
        if (!meta) {
          result[item.id] = { hasNew: false };
          continue;
        }

        const last = meta.last_episode_to_air;
        const next = meta.next_episode_to_air; // may be null

        let hasNew = false;
        if (last?.season_number != null && last?.episode_number != null) {
          if (last.season_number > (item.season || 0)) hasNew = true;
          else if (
            last.season_number === (item.season || 0) &&
            last.episode_number > (item.episode || 0)
          ) {
            hasNew = true;
          }
        }

        if (!hasNew && next?.air_date) {
          try {
            const nextDate = new Date(next.air_date);
            const today = new Date();
            if (nextDate <= today) {
              if (
                next.season_number > (item.season || 0) ||
                (next.season_number === (item.season || 0) &&
                  next.episode_number > (item.episode || 0))
              ) {
                hasNew = true;
              }
            }
          } catch {}
        }

        result[item.id] = {
          hasNew,
          next: next
            ? {
                season: next.season_number,
                episode: next.episode_number,
                air_date: next.air_date,
                name: next.name,
              }
            : undefined,
        };
      }

      if (!aborted) {
        setAlerts(result);
        setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [tvItems]);

  const totalNew = useMemo(
    () => Object.values(alerts).filter((a) => a?.hasNew).length,
    [alerts]
  );

  return { alerts, totalNew, loading };
}