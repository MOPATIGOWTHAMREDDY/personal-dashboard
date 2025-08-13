export default async function handler(req, res) {
  const { path } = req.query;
  
  try {
    const response = await fetch(`https://image.tmdb.org/t/p/${path.join('/')}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StealthBot/1.0)',
        'Referer': 'https://www.themoviedb.org/',
      },
    });

    if (!response.ok) {
      return res.status(404).end();
    }

    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', response.headers.get('content-type'));
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).end();
  }
}
