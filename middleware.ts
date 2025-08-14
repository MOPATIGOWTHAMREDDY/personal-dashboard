import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASIC = (process.env.BASIC_AUTH || '').trim(); // "user:pass"
const [AUTH_USER, AUTH_PASS] = BASIC ? BASIC.split(':') : ['', ''];

// Enable protection only if BASIC_AUTH is configured (and not empty)
const AUTH_ENABLED = Boolean(AUTH_USER && AUTH_PASS);

// Public URL prefixes (no auth). Use prefix matches, no trailing slash needed.
const PUBLIC_PREFIXES = [
  '/_next',                // static and images
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/icon',                 // favicon variants
  '/apple-touch-icon',     // iOS icons
  '/opengraph-image',      // OG image routes (Next.js image gen)
  '/manifest.json',        // common manifest path
  '/manifest.webmanifest', // your existing one
  '/api/proxy',            // IMPORTANT: allow both /api/proxy and /api/proxy?...
  '/api/auth',             // NextAuth endpoints (if used)
  '/api/health',           // health checks (optional)
  // Note: Next serves /public/* at the root path, so no "/public" prefix is needed
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function decodeBasic(b64: string): string {
  try {
    // @ts-ignore
    if (typeof atob === 'function') return atob(b64);
  } catch {}
  try {
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths (no auth)
  if (isPublicPath(pathname)) {
    return addSecurityHeaders(NextResponse.next(), req, /*isApi=*/ pathname.startsWith('/api'));
  }

  // If BASIC_AUTH is not configured, just pass through with security headers
  if (!AUTH_ENABLED) {
    return addSecurityHeaders(NextResponse.next(), req, /*isApi=*/ pathname.startsWith('/api'));
  }

  // Basic Auth check
  const authHeader = req.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !token) {
    return challenge();
  }

  const decoded = decodeBasic(token);
  const sep = decoded.indexOf(':');
  const user = sep >= 0 ? decoded.slice(0, sep) : '';
  const pass = sep >= 0 ? decoded.slice(sep + 1) : '';

  if (user === AUTH_USER && pass === AUTH_PASS) {
    // Auth OK
    return addSecurityHeaders(NextResponse.next(), req, /*isApi=*/ pathname.startsWith('/api'));
  }

  // Auth failed
  return challenge();
}

function challenge() {
  return new NextResponse('🔒 Access Restricted', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Stealth Zone"',
      'Cache-Control': 'no-store',
    },
  });
}

// Add safe security headers without breaking iframes/proxy
function addSecurityHeaders(res: NextResponse, req: NextRequest, isApi: boolean) {
  const accept = req.headers.get('accept') || '';
  const isHtml = accept.includes('text/html');

  // Avoid X-Frame-Options on API responses; keep SAMEORIGIN for pages
  if (!isApi) {
    res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  if (isHtml) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  // Set HSTS only when behind HTTPS (avoid issues in local dev)
  if (req.nextUrl.protocol === 'https:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return res;
}

// Exclude _next static/image and explicitly exclude api/proxy from this middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/proxy).*)',
  ],
};