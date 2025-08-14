import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

function send(res: NextApiResponse, code: number, msg: string) {
  res.status(code).json({ error: msg });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = (req.query.url as string) || (req.query.u as string) || '';
    if (!raw) return send(res, 400, 'Missing url');

    const target = new URL(raw);
    if (!/^https?:$/.test(target.protocol)) return send(res, 400, 'Invalid protocol');

    const fHeaders = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (!v) continue;
      const key = k.toLowerCase();
      if (['host', 'connection', 'content-length', 'accept-encoding'].includes(key)) continue;
      if (key === 'user-agent') {
        fHeaders.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
      } else {
        fHeaders.set(key, Array.isArray(v) ? v.join(', ') : v);
      }
    }

    const upstream = await fetch(target.toString(), {
      method: req.method || 'GET',
      headers: fHeaders,
      redirect: 'follow',
    });

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      const lk = key.toLowerCase();
      if (['content-security-policy', 'x-frame-options'].includes(lk)) return;
      res.setHeader(key, value);
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Vary', 'Origin');
    res.setHeader('Cache-Control', 'no-store');

    if (!upstream.body) {
      const buf = await upstream.arrayBuffer();
      res.end(Buffer.from(buf));
      return;
    }

    const reader = (upstream.body as any).getReader?.();
    if (reader) {
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) return res.end();
        res.write(Buffer.from(value));
        return pump();
      };
      await pump();
    } else {
      const buf = await upstream.arrayBuffer();
      res.end(Buffer.from(buf));
    }
  } catch (e: any) {
    send(res, 502, e?.message || 'Proxy error');
  }
}