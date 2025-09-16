import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define public routes (accessible without authentication)
  const publicRoutes = ['/signin', '/signup', '/'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If no token and trying to access protected route, redirect to signin
  if (!token && !isPublicRoute) {
    console.log('No token found, redirecting to signin');
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If has token and trying to access auth pages, redirect to dashboard
  if (token && (pathname === '/signin' || pathname === '/signup' || pathname === '/')) {
    console.log('Token found, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
