// api/proxy/route.ts - Enhanced Stealth Version
import { NextRequest, NextResponse } from 'next/server';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

const REALISTIC_REFERRERS = [
  'https://www.google.com/search?q=watch+movies+online',
  'https://www.reddit.com/r/movies/',
  'https://www.imdb.com/',
  'https://letterboxd.com/',
  'https://www.themoviedb.org/',
  'https://duckduckgo.com/?q=streaming+movies'
];

// More realistic accept languages
const ACCEPT_LANGUAGES = [
  'en-US,en;q=0.9',
  'en-US,en;q=0.9,es;q=0.8',
  'en-GB,en;q=0.9,en-US;q=0.8',
  'en-US,en;q=0.8,fr;q=0.6',
  'en-CA,en;q=0.9,fr;q=0.8'
];

const VIEWPORT_SIZES = [
  '1920,1080',
  '1366,768',
  '1440,900',
  '1536,864',
  '1280,720'
];

// Allowed domains for security
const ALLOWED_DOMAINS = [
  'iframe.pstream.mov',
  'pstream.mov',
  'vidlink.pro',
  'vidsrc.xyz',
  'vidsrc.me',
  'vidsrc.to'
];

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get('url');
    
    if (!url) {
      console.error('No URL provided');
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    console.log('🔄 Proxy request for:', decodeURIComponent(url));

    // Validate and clean URL
    let targetUrl: URL;
    try {
      const decodedUrl = decodeURIComponent(url);
      targetUrl = new URL(decodedUrl);
    } catch (e) {
      console.error('❌ Invalid URL:', url);
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Check if domain is allowed
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      targetUrl.hostname === domain || targetUrl.hostname.endsWith('.' + domain)
    );

    if (!isAllowed) {
      console.error('❌ Domain not allowed:', targetUrl.hostname);
      return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
    }

    // Random delay to mimic human behavior
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate realistic browser fingerprint
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const acceptLanguage = ACCEPT_LANGUAGES[Math.floor(Math.random() * ACCEPT_LANGUAGES.length)];
    const viewport = VIEWPORT_SIZES[Math.floor(Math.random() * VIEWPORT_SIZES.length)];
    const referrer = REALISTIC_REFERRERS[Math.floor(Math.random() * REALISTIC_REFERRERS.length)];

    // Enhanced headers to mimic real browser
    const headers = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': acceptLanguage,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Charset': 'utf-8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'iframe',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'cross-site',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive',
      'DNT': '1',
      'Referer': referrer,
      
      // Browser fingerprinting resistance
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-Data': 'CI22yQEIorbJAQjBtskBCKmdygEIwOHKAQiUocsBCJz+zAEI2YjNAQi5ys0BCIrTzQE=',
      
      // Viewport info
      'Viewport-Width': viewport.split(',')[0],
      'Device-Memory': '8',
      'Save-Data': 'off'
    };

    console.log('🌐 Fetching with User-Agent:', userAgent.split(' ')[0]);
    console.log('🔗 Using Referrer:', referrer);

    // Make the request with enhanced stealth
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(20000), // 20 seconds timeout
      // Disable redirect following to handle them manually
      redirect: 'follow'
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle different response codes
    if (response.status === 401) {
      console.error('❌ 401 Unauthorized - possible anti-bot detection');
      // Try alternative approach or return a more helpful error
      return NextResponse.json(
        { 
          error: 'Access denied by upstream server', 
          details: 'The streaming service may be blocking proxy requests',
          suggestion: 'Try using direct URLs or a different source'
        }, 
        { status: 401 }
      );
    }

    if (response.status === 403) {
      console.error('❌ 403 Forbidden - possible geo-blocking or rate limiting');
      return NextResponse.json(
        { 
          error: 'Forbidden by upstream server',
          details: 'May be geo-blocked or rate limited'
        }, 
        { status: 403 }
      );
    }

    if (!response.ok) {
      console.error('❌ Upstream error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Upstream server error: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    const data = await response.text();
    console.log('✅ Successfully fetched', data.length, 'characters');
    
    // Get content type and handle different types
    const contentType = response.headers.get('Content-Type') || 'text/html';
    
    // Create response with minimal tracking headers
    const proxyResponse = new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Expires': '0',
        'Pragma': 'no-cache',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
        
        // CORS headers for iframe embedding
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        
        // Remove frame restrictions for embedding
        // 'X-Frame-Options': 'SAMEORIGIN', // More permissive than DENY
        
        // Security headers that don't break functionality
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      },
    });

    return proxyResponse;

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    
    if (error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout', details: 'Upstream server took too long to respond' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Proxy request failed', details: error.message },
      { status: 500 }
    );
  }
}

// Enhanced OPTIONS handler for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  });
}