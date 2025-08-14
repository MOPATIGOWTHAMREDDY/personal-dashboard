// Next.js API route: resolve PStream (pstream.mov / iframe.pstream.mov) pages
// to an inner embeddable player (e.g., xprime.tv). Returns { ok, url? }.

const ALLOWED_EMBED_HOSTS = ['xprime.tv'];

function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function makeCandidates({ type, id, title, season, episode }) {
  const slug = slugify(title);
  const q = 'theme=default&language=en&logo=false';

  if (type === 'tv') {
    return [
      `https://pstream.mov/media/tmdb-tv-${id}-${slug}/${season}/${episode}?${q}`,
      `https://pstream.mov/media/tmdb-tv-${id}/${season}/${episode}?${q}`,
      `https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?server=streambox&${q}`,
      `https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?${q}`,
    ];
  }
  return [
    `https://pstream.mov/media/tmdb-movie-${id}-${slug}?${q}`,
    `https://pstream.mov/media/tmdb-movie-${id}?${q}`,
    `https://iframe.pstream.mov/embed/tmdb-movie-${id}?server=streambox&${q}`,
    `https://iframe.pstream.mov/embed/tmdb-movie-${id}?${q}`,
  ];
}

// extract <iframe src="..."> entries
function extractIframeSrc(html) {
  if (!html) return [];
  const re = /<iframe[^>]+src=["']([^"']+)["']/gi;
  let m;
  const found = [];
  while ((m = re.exec(html)) !== null) {
    const url = m[1];
    if (url) found.push(url);
  }
  return found;
}

function toAbsolute(base, url) {
  try {
    return new URL(url, base).toString();
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const type = String(req.query.type || ''); // 'movie' | 'tv'
    const id = String(req.query.id || '');
    const title = String(req.query.title || '');
    const season = req.query.season ? Number(req.query.season) : undefined;
    const episode = req.query.episode ? Number(req.query.episode) : undefined;

    if (!type || !id) {
      res.status(400).json({ ok: false, error: 'Missing required params: type, id' });
      return;
    }

    const candidates = makeCandidates({ type, id, title, season, episode });

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: 'https://pstream.mov/',
    };

    for (const url of candidates) {
      try {
        const r = await fetch(url, { headers, redirect: 'follow' });
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('text/html')) continue;
        const html = await r.text();
        const iframes = extractIframeSrc(html) || [];
        for (const src of iframes) {
          const abs = toAbsolute(url, src);
          if (!abs) continue;
          try {
            const host = new URL(abs).hostname;
            if (ALLOWED_EMBED_HOSTS.some((h) => host.endsWith(h))) {
              res.status(200).json({ ok: true, url: abs });
              return;
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // try next candidate
      }
    }

    res.status(200).json({ ok: false, error: 'No embeddable iframe found from pstream.' });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Resolver internal error.' });
  }
}