// Next.js API route: proxies an embeddable page and strips X-Frame-Options/CSP.
// Injects <base href="..."> so relative assets load. Only whitelisted hosts allowed.

const ALLOWED_HOST_PATTERNS = [
  /(^|\.)xprime\.tv$/i,
  // Add other inner players you confirmed:
  // /(^|\.)streambox\./i,
  // /(^|\.)primenet\./i,
  // /(^|\.)phoenix\./i,
  // /(^|\.)fox\./i,
];

function stripCspMeta(html) {
  try {
    return html
      .replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, '')
      .replace(/<meta[^>]+http-equiv=["']x-webkit-csp["'][^>]*>/gi, '');
  } catch {
    return html;
  }
}

function ensureBaseTag(html, baseHref) {
  try {
    if (!baseHref) return html;
    const hasHead = /<head[^>]*>/i.test(html);
    if (!hasHead) {
      return `<!doctype html><html><head><base href="${baseHref}"></head><body>${html}</body></html>`;
    }
    const hasBase = /<base[^>]+href=/i.test(html);
    if (hasBase) return html;
    return html.replace(/<head[^>]*>/i, (m) => `${m}<base href="${baseHref}">`);
  } catch {
    return html;
  }
}

export default async function handler(req, res) {
  try {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).send('Missing url');

    let target;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).send('Invalid url');
    }

    const okHost = ALLOWED_HOST_PATTERNS.some((re) => re.test(target.hostname));
    if (!okHost) return res.status(400).send('Host not allowed');

    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: `${target.origin}/`,
    };

    const upstream = await fetch(target.toString(), { headers, redirect: 'follow' });

    const contentType = upstream.headers.get('content-type') || 'text/html; charset=utf-8';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');

    if ((contentType || '').includes('text/html')) {
      let html = await upstream.text();

      const baseHref = target.toString();
      html = stripCspMeta(html);
      html = ensureBaseTag(html, baseHref);

      // also neutralize occurrences of X-Frame-Options in inline text/meta (rare)
      html = html.replace(/x-frame-options/gi, 'x-frame-options-removed');

      // ensure we don't send restrictive headers
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('X-Frame-Options');

      return res.status(upstream.ok ? upstream.status : 200).send(html);
    }

    // For non-HTML assets: just stream the content
    const arrBuf = await upstream.arrayBuffer();
    return res.status(upstream.status).send(Buffer.from(arrBuf));
  } catch (e) {
    return res.status(500).send('Proxy error');
  }
}