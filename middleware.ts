import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Create an unmodified response
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize the Supabase Server Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
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

  // 3. Fetch the current user session securely from the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. DEFINE YOUR PUBLIC ROUTES (URLs that DO NOT require login)
  const isPublicRoute = 
   
    request.nextUrl.pathname === '/'; // The landing page

  // 5. THE BOUNCER LOGIC
  // If the user is NOT logged in and trying to access a restricted route...
  if (!user && !isPublicRoute) {
    // Redirect them immediately to the login page
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/';
    return NextResponse.redirect(loginUrl);
  }

  // If the user IS logged in but tries to go to the login page, send them to the dashboard
  if (user && isPublicRoute && request.nextUrl.pathname !== '/') {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

// 6. THE MATCHER CONFIGURATION
// This tells Next.js exactly which routes the middleware should run on.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files like your compiled CSS/JS)
     * - _next/image (image optimization files)
     * - favicon.ico (browser icon)
     * - Any file with an extension (e.g., .png, .jpg, .svg)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};