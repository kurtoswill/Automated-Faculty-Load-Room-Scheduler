import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleHome = (role?: string) => {
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Instructor') return '/instructor/dashboard';
  if (role === 'Student') return '/student/dashboard';
  return '/';
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value
    ?? request.headers.get('authorization')?.replace('Bearer ', '');
  const role = request.cookies.get('role')?.value;

  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === '/' ||
    pathname === '/forgot-password' ||
    pathname.startsWith('/reset-password/');

  if (isPublic) return NextResponse.next();
  if (!token) return NextResponse.redirect(new URL('/', request.url));

  if (pathname.startsWith('/admin') && role !== 'Admin') {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (pathname.startsWith('/instructor') && role !== 'Instructor') {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (pathname.startsWith('/student') && role !== 'Student') {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  if (pathname.startsWith('/requests') && role !== 'Instructor') {
    return NextResponse.redirect(new URL(roleHome(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/instructor/:path*',
    '/student/:path*',
    '/requests/:path*',
    '/notifications',
    '/profile',
    '/change-password',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};

