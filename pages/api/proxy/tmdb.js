export default async function handler(req, res) {
  // Verify internal request
  const proxySecret = req.headers['x-proxy-secret'];
  if (proxySecret !== process.env.PROXY_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { path, ...query } = req.query;
  const queryString = new URLSearchParams(query).toString();
  
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${path.join('/')}?api_key=${process.env.TMDB_API_KEY}&${queryString}`,
      {
        method: req.method,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; StealthBot/1.0)',
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      }
    );

    const data = await response.json();
    
    // Remove traces
    delete data.page;
    delete data.total_pages;
    
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
