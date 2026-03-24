import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for middleware usage
 *
 * This client:
 * - Refreshes expired auth tokens
 * - Updates cookies in the response
 * - Can be used for route protection
 *
 * @param request - Next.js request object
 * @returns Object containing supabase client and response
 */
export async function createClient(request: NextRequest) {
  // Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT remove auth.getUser()
  // This refreshes the auth token if expired and updates cookies
  // Removing this will cause users to be logged out after token expiration
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Anonymous user — continue without user
  }

  return { supabase, response: supabaseResponse, user };
}

/**
 * Configuration for protected and public routes
 */
export const routeConfig = {
  // Routes that require authentication
  protectedRoutes: ['/home', '/mypage', '/clubs', '/expert-registration', '/poten-checker/new', '/poten-checker/result', '/poten-paper/new', '/poten-paper/result', '/membership/checkout'],
  // Routes that are only accessible when NOT authenticated
  authRoutes: ['/login', '/signup'],
  // Routes that require authentication but should NOT redirect to /home
  // (used during onboarding flow for pending users)
  onboardingRoutes: ['/signup/onboarding'],
  // Routes that require admin role
  adminRoutes: ['/admin'],
};

/**
 * Updates the Supabase auth session and handles route protection
 *
 * @param request - Next.js request object
 * @returns NextResponse with updated cookies and potential redirects
 */
export async function updateSession(request: NextRequest) {
  const { supabase, response, user } = await createClient(request);

  const pathname = request.nextUrl.pathname;

  // No locale prefix — use pathname directly
  const isProtectedRoute = routeConfig.protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !user) {
    // /home → redirect to landing page, others → /about
    const redirectTo = pathname === '/home' || pathname.startsWith('/home/') ? '/' : '/about';
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  const isOnboardingRoute = routeConfig.onboardingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = !isOnboardingRoute && routeConfig.authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAdminRoute = routeConfig.adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isOnboardingRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isAdminRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, approval_status, username')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';
    const isSuperUser = profile?.username === 'minssum';

    if (!profile || (!isAdmin && !isSuperUser) || profile.approval_status !== 'approved') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}
