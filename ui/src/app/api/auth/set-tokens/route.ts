import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, refreshToken } = await request.json();
  const cookieStore = await cookies();

  if (token) {
    cookieStore.set('token', token, {
      httpOnly: false, // 🟢 false شد تا axiosClient در مرورگر بتواند آن را بخواند
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 روز
    });
  }

  if (refreshToken) {
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true, // 🟢 رفرش توکن برای امنیت بیشتر باید حتما httpOnly بماند
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // سخت‌گیری بیشتر برای جلوگیری از CSRF
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 روز
    });
  }

  return NextResponse.json({ success: true });
}