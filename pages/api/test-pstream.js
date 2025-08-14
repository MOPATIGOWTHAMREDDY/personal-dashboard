export default async function handler(req, res) {
  const { url } = req.body;
  
  try {
    console.log('🔍 Testing PStream URL:', url);
    
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://pstream.mov/',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    
    const working = response.ok || (response.status >= 300 && response.status < 400);
    
    console.log(`${working ? '✅' : '❌'} ${url} - Status: ${response.status}`);
    
    res.json({
      working,
      status: response.status,
      url: url
    });
    
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
    
    res.json({
      working: false,
      error: error.message,
      url: url
    });
  }
}
