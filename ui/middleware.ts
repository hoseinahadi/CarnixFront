import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // گرفتن توکن از کوکی
  const token = request.cookies.get('token')?.value;

  // مسیرهایی که نیاز به لاگین دارند (مثل پروفایل و سفارشات)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile');

  // اگر کاربر قصد ورود به مسیرهای محافظت شده را دارد و توکن ندارد
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // مسیرهای مربوط به احراز هویت (اگر لاگین بود، نباید صفحه لاگین را ببیند)
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// مسیرهایی که میدل‌ور باید روی آن‌ها اجرا شود
export const config = {
  matcher: ['/profile/:path*', '/login', '/register'],
};