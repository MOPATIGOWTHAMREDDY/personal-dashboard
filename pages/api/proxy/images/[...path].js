export default async function handler(req, res) {
  const { path } = req.query;
  
  try {
    const pathString = Array.isArray(path) ? path.join('/') : path;
    const imageUrl = `https://image.tmdb.org/t/p/${pathString}`;
    
    console.log('🖼️ Proxying image:', imageUrl);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MediaHub/1.0)',
        'Referer': 'https://www.themoviedb.org/',
      },
    });

    if (!response.ok) {
      return res.status(404).end();
    }

    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ Image proxy error:', error);
    res.status(500).end();
  }
}
