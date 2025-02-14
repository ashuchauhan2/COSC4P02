import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthPage = req.nextUrl.pathname === '/signin' || 
                    req.nextUrl.pathname === '/signup' ||
                    req.nextUrl.pathname === '/forgot-password';

  // If user is signed in and tries to access auth pages, redirect to dashboard
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/protected/dashboard', req.url));
  }

  // If user is not signed in and tries to access protected routes, redirect to signin
  if (!session && req.nextUrl.pathname.startsWith('/protected')) {
    const redirectUrl = new URL('/signin', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Update the matcher to include auth pages and protected routes
export const config = {
  matcher: [
    '/protected/:path*',
    '/signin',
    '/signup',
    '/forgot-password'
  ],
}; 