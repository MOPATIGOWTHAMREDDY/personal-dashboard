export default async function handler(req, res) {
  const { path } = req.query;
  
  try {
    const apiKey = process.env.TMDB_API_KEY || 'd20da4614eefb21107f726bae23e6994';
    const pathString = Array.isArray(path) ? path.join('/') : path;
    
    const url = new URL(`https://api.themoviedb.org/3/${pathString}`);
    url.searchParams.set('api_key', apiKey);
    
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) {
        url.searchParams.set(key, value);
      }
    });

    // ✅ Conditional logging - only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Proxying to:', url.toString());
    }

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; MediaHub/1.0)',
      },
    });

    if (!response.ok) {
      // Keep error logs even in production
      console.error('❌ TMDB API Error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `TMDB API Error: ${response.status}` 
      });
    }

    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Proxy-Secret');
    
    res.status(200).json(data);
  } catch (error) {
    // Always log errors
    console.error('❌ Proxy error:', error);
    res.status(500).json({ error: 'Internal proxy error', details: error.message });
  }
}
