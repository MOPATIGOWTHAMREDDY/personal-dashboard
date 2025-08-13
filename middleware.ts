import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const [AUTH_USER, AUTH_PASS] = (process.env.BASIC_AUTH || 'admin:password').split(':');

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  // Public paths that don't need authentication
  const publicPaths = [
    '/_next/', 
    '/favicon.ico', 
    '/api/proxy/', 
    '/robots.txt'
  ];
  
  // Skip auth for public paths
  if (publicPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for authentication
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return new NextResponse('🔒 Access Restricted', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Stealth Zone"',
        'Cache-Control': 'no-store',
      },
    });
  }

  try {
    const basicAuth = authHeader.split(' ')[1];
    const [user, pass] = atob(basicAuth).split(':');

    if (user === AUTH_USER && pass === AUTH_PASS) {
      // Add security headers
      const response = NextResponse.next();
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Referrer-Policy', 'no-referrer');
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      
      return response;
    }
  } catch (error) {
    console.error('Auth error:', error);
  }

  return new NextResponse('🔒 Access Denied', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Stealth Zone"',
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
