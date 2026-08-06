import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/profile',
  '/checkout',
] as const;

const AUTH_PREFIXES = [
  '/login',
  '/register',
] as const;

const startsWithAny = (
  pathname: string,
  prefixes: readonly string[],
): boolean =>
  prefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname, search } = request.nextUrl;

  if (
    startsWithAny(pathname, PROTECTED_PREFIXES) &&
    !token
  ) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set(
      'callbackUrl',
      `${pathname}${search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  if (
    startsWithAny(pathname, AUTH_PREFIXES) &&
    token
  ) {
    return NextResponse.redirect(
      new URL('/', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/checkout/:path*',
    '/login/:path*',
    '/register/:path*',
  ],
};
