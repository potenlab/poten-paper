import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  const pathname = request.nextUrl.pathname;

  // Skip auth for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return intlResponse;
  }

  // Protected routes that require authentication
  const protectedRoutes = ['/poten-paper/new', '/poten-paper/result'];
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const { response: supabaseResponse, user } = await createClient(request);

  // Copy Supabase cookies to intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie);
  });

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/poten-paper', request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
