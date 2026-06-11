import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/utils/auth';

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const path = nextUrl.pathname;

  const token = cookies.get('auth_token')?.value;
  let userSession = null;

  if (token) {
    userSession = await verifyJWT(token);
  }

  const isAuthPage = path === '/login' || path === '/register';
  const isApiRoute = path.startsWith('/api/');
  const isRootPath = path === '/';
  const isStaticFile = path.includes('.') || path.startsWith('/_next/');

  // If it's a static file, API route, or the root path, let it pass through
  if (isStaticFile || isApiRoute || isRootPath) {
    return NextResponse.next();
  }

  // 1. If not authenticated, and trying to access app pages -> Redirect to /login
  if (!userSession && !isAuthPage && !isRootPath) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear invalid/stale token if present
    if (token) {
      response.cookies.delete('auth_token');
    }
    return response;
  }

  // 2. If authenticated, and trying to access login/register -> Redirect to Dashboard
  if (userSession && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Config to specify which routes should trigger middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/cron/reminder (cron scheduler API)
     * - api/auth/confirm (email confirmation endpoint)
     * - _next/static (static files)
     * - _next/image (Next.js image optimization)
     * - favicon.ico (favicon file)
     * - static files (images, sitemap.xml, robots.txt, etc.)
     */
    '/((?!api/cron/reminder|api/auth/confirm|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml|txt)$).*)',
  ],
};
