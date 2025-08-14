/* eslint-disable import/no-anonymous-default-export */
// Cloudflare Worker proxy with HTML rewriting.
// Usage: Deploy, then set NEXT_PUBLIC_PROXY_PREFIX="https://your-subdomain.workers.dev/?u="
// Open: https://your-subdomain.workers.dev/?u=https%3A%2F%2Fiframe.pstream.mov%2Fembed%2F...

const ALLOW = new Set(['iframe.pstream.mov', 'pstream.mov', 'vidlink.pro', 'vidsrc.xyz']);

function absolutize(url, base) {
  try {
    return new URL(url, base).toString();
  } catch {
    return url;
  }
}

function proxify(url, requestUrl) {
  const workerBase = new URL(requestUrl);
  return `${workerBase.origin}${workerBase.pathname}?u=${encodeURIComponent(url)}`;
}

const rewriter = (requestUrl) =>
  new rewriter()
    .on('a[href]', {
      element(el) {
        const href = el.getAttribute('href');
        if (href) el.setAttribute('href', proxify(absolutize(href, requestUrl), requestUrl));
      }
    })
    .on('link[href]', {
      element(el) {
        const href = el.getAttribute('href');
        if (href) el.setAttribute('href', proxify(absolutize(href, requestUrl), requestUrl));
      }
    })
    .on('script[src]', {
      element(el) {
        const src = el.getAttribute('src');
        if (src) el.setAttribute('src', proxify(absolutize(src, requestUrl), requestUrl));
      }
    })
    .on('img[src]', {
      element(el) {
        const src = el.getAttribute('src');
        if (src) el.setAttribute('src', proxify(absolutize(src, requestUrl), requestUrl));
      }
    })
    .on('iframe[src]', {
      element(el) {
        const src = el.getAttribute('src');
        if (src) el.setAttribute('src', proxify(absolutize(src, requestUrl), requestUrl));
      }
    })
    .on('video[src]', {
      element(el) {
        const src = el.getAttribute('src');
        if (src) el.setAttribute('src', proxify(absolutize(src, requestUrl), requestUrl));
      }
    });

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetRaw = url.searchParams.get('u') || url.searchParams.get('url');
    if (!targetRaw) {
      return new Response('Missing u param', { status: 400 });
    }

    let target;
    try {
      target = new URL(targetRaw);
    } catch {
      return new Response('Invalid target url', { status: 400 });
    }

    if (!ALLOW.has(target.hostname)) {
      return new Response('Host not allowed', { status: 400 });
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://pstream.mov/',
        'Origin': 'https://pstream.mov'
      },
      redirect: 'follow'
    });

    const contentType = upstream.headers.get('content-type') || '';
    const sanitizedHeaders = new Headers();
    sanitizedHeaders.set('Cache-Control', 'no-store');
    sanitizedHeaders.set('Content-Type', contentType.includes('text/html') ? 'text/html; charset=utf-8' : contentType);

    // If HTML, rewrite all URLs to go back through this worker
    if (contentType.includes('text/html')) {
      return new rewriter()
        .transform(new Response(upstream.body, { status: upstream.status, headers: sanitizedHeaders }))
        .transform(rewriter(target.toString()))
        .transform(new Response()) // chainable pattern
        .then((resp) => resp);
    }

    // For non-HTML (scripts, images, HLS playlists, etc.), just stream through
    return new Response(upstream.body, { status: upstream.status, headers: sanitizedHeaders });
  }
};