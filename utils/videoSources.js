// Keep your exact VIDEO_SOURCES list (unchanged)
export const VIDEO_SOURCES = [
  {
    key: "pstream-streambox",
    name: "PStream (StreamBox)",
    movieUrlPattern: "https://iframe.pstream.mov/embed/tmdb-movie-{id}?server=streambox&theme=default&language=en&logo=false&allinone=true",
    tvUrlPattern: "https://iframe.pstream.mov/embed/tmdb-tv-{id}/{season}/{episode}?server=streambox&theme=default&language=en&logo=false&allinone=true",
    featured: true,
    serverType: "streambox",
    quality: "HD",
    speed: "fast"
  },
  {
    key: "pstream-default",
    name: "PStream (Default)",
    movieUrlPattern: "https://iframe.pstream.mov/embed/tmdb-movie-{id}?theme=default&language=en&logo=false",
    tvUrlPattern: "https://iframe.pstream.mov/embed/tmdb-tv-{id}/{season}/{episode}?theme=default&language=en&logo=false",
    featured: true,
    serverType: "default",
    quality: "HD",
    speed: "medium"
  },
  {
    key: "pstream-media",
    name: "PStream (Media)",
    movieUrlPattern: "https://iframe.pstream.mov/media/tmdb-movie-{id}?theme=default&language=en&logo=false",
    tvUrlPattern: "https://iframe.pstream.mov/media/tmdb-tv-{id}/{season}/{episode}?theme=default&language=en&logo=false",
    featured: true,
    serverType: "media",
    quality: "HD",
    speed: "medium"
  },
  {
    key: "vidlink",
    name: "VidLink",
    premium: true,
    adFree: true,
    movieUrlPattern: "https://vidlink.pro/movie/{id}?autoplay=true&title=true",
    tvUrlPattern: "https://vidlink.pro/tv/{id}/{season}/{episode}?autoplay=true&title=true",
    featured: true,
    quality: "HD",
    speed: "fast"
  },
  {
    key: "vidsrc-xyz",
    name: "VidSrc.xyz",
    premium: true,
    adFree: true,
    movieUrlPattern: "https://vidsrc.xyz/embed/movie?tmdb={id}&ds_lang=en",
    tvUrlPattern: "https://vidsrc.xyz/embed/tv?tmdb={id}&season={season}&episode={episode}&ds_lang=en",
    featured: true,
    quality: "HD",
    speed: "fast"
  }
];

// -------- Stealth helpers & factory --------

const normalizeForNewTab = (base) => {
  if (!base) return '';
  try {
    const u = new URL(base);
    // Prefer pstream.mov + /media for non-iframe direct opening
    const isPStream =
      u.hostname === 'pstream.mov' || u.hostname === 'iframe.pstream.mov' || u.hostname.endsWith('.pstream.mov');
    if (isPStream) {
      if (u.hostname !== 'pstream.mov') u.hostname = 'pstream.mov';
      if (u.pathname.startsWith('/embed/')) {
        u.pathname = u.pathname.replace('/embed/', '/media/');
      }
    }
    return u.toString();
  } catch {
    return base;
  }
};

// Build URL from pattern safely
const buildUrl = (pattern, id, season, episode) => {
  if (typeof pattern !== 'string' || !pattern) return '';
  let url = pattern.replace('{id}', String(id ?? ''));
  if (season != null) url = url.replace('{season}', String(season));
  if (episode != null) url = url.replace('{episode}', String(episode));
  return url;
};

// Deterministic "enhanced" params (no random t/r that cause reload loops)
const enhance = (raw) => {
  if (!raw) return '';
  try {
    const u = new URL(raw);
    const params = {
      autoplay: '1',
      muted: '0',
      controls: '1',
      modestbranding: '1',
      rel: '0',
      showinfo: '0',
      iv_load_policy: '3',
      fs: '1',
      cc_load_policy: '0',
      disablekb: '0',
      enablejsapi: '1',
      playsinline: '1'
    };
    for (const [k, v] of Object.entries(params)) {
      if (!u.searchParams.has(k)) u.searchParams.set(k, v);
    }
    return u.toString();
  } catch {
    return raw;
  }
};

// Client-side proxy prefix (query form), e.g. "/api/proxy?url=" or "https://your-worker.workers.dev/?u="
const PROXY_PREFIX = process.env.NEXT_PUBLIC_PROXY_PREFIX || '';
const STEALTH_MODE = (process.env.NEXT_PUBLIC_STEALTH_PROXY || 'off').toLowerCase() === 'on';
const PROXY_NEW_TAB = (process.env.NEXT_PUBLIC_PROXY_NEW_TAB || 'off').toLowerCase() === 'on';

// Route a URL via proxy prefix if enabled
const viaProxy = (url) => {
  if (!STEALTH_MODE || !PROXY_PREFIX || !url) return url;
  // Encode as query param for simple proxy endpoints
  return `${PROXY_PREFIX}${encodeURIComponent(url)}`;
};

export const createVideoSource = (source) => {
  // Stable, closed-over helpers
  const getDirectMovieUrl = (id) => buildUrl(source.movieUrlPattern, id);
  const getDirectTVUrl = (id, season, episode) => buildUrl(source.tvUrlPattern, id, season, episode);

  const getEnhancedMovieUrl = (id) => enhance(getDirectMovieUrl(id));
  const getEnhancedTVUrl = (id, season, episode) => enhance(getDirectTVUrl(id, season, episode));

  const getProxyMovieUrl = (id) => viaProxy(getEnhancedMovieUrl(id));
  const getProxyTVUrl = (id, season, episode) => viaProxy(getEnhancedTVUrl(id, season, episode));

  const getMovieUrl = (id) => (STEALTH_MODE ? getProxyMovieUrl(id) : getEnhancedMovieUrl(id));
  const getTVUrl = (id, season, episode) => (STEALTH_MODE ? getProxyTVUrl(id, season, episode) : getEnhancedTVUrl(id, season, episode));

  const getOpenInNewTabUrl = (id, season, episode) => {
    // Base normalized for PStream media
    const base =
      season != null && episode != null
        ? normalizeForNewTab(getDirectTVUrl(id, season, episode))
        : normalizeForNewTab(getDirectMovieUrl(id));
    // Optionally also route through proxy for IP masking on new tab
    return PROXY_NEW_TAB ? viaProxy(base) : base;
  };

  return {
    key: source.key,
    name: source.name,
    featured: !!source.featured,
    quality: source.quality || 'SD',
    speed: source.speed || 'medium',
    serverType: source.serverType,
    premium: !!source.premium,
    adFree: !!source.adFree,

    // Player API
    getMovieUrl,
    getTVUrl,
    getOpenInNewTabUrl,

    // Optional strategy-specific helpers
    getDirectMovieUrl,
    getDirectTVUrl,
    getEnhancedMovieUrl,
    getEnhancedTVUrl
  };
};

export const videoSources = VIDEO_SOURCES.map(createVideoSource);