// pages/api/stream-proxy.js
export default async function handler(req, res) {
  const { url } = req.query;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, application/octet-stream, */*',
        'Origin': 'https://pstream.mov',
        'Referer': 'https://pstream.mov/'
      }
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Stream not available' });
    }
    
    const contentType = response.headers.get('content-type');
    const body = await response.text();
    
    // Check if it's a valid m3u8 playlist
    if (body.startsWith('#EXTM3U')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(body);
    } else {
      res.status(400).json({ error: 'Invalid playlist format' });
    }
    
  } catch (error) {
    res.status(500).json({ error: 'Proxy error', details: error.message });
  }
}
