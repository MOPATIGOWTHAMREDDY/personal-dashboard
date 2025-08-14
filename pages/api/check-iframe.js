// pages/api/check-iframe.js
export default async function handler(req, res) {
  const { url } = req.body;
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    // Check for iframe-blocking headers
    const xFrameOptions = response.headers.get('x-frame-options');
    const csp = response.headers.get('content-security-policy');
    
    const blocked = (
      xFrameOptions && (xFrameOptions.includes('DENY') || xFrameOptions.includes('SAMEORIGIN')) ||
      csp && csp.includes('frame-ancestors')
    );
    
    res.json({
      working: !blocked && (response.ok || (response.status >= 300 && response.status < 400)),
      status: response.status,
      blocked: blocked,
      url: url
    });
    
  } catch (error) {
    res.json({
      working: false,
      error: error.message,
      url: url
    });
  }
}
