import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function POST(request: Request) {
  const body = await request.json();
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  const refreshToken = typeof body?.refreshToken === 'string' ? body.refreshToken.trim() : '';
  const cookieStore = await cookies();

  if (!token) {
    return NextResponse.json({ success: false, message: 'توکن ورود ارسال نشده است.' }, { status: 400 });
  }

  if (token) {
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
    });
  }

  if (refreshToken) {
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  } else {
    cookieStore.delete('refreshToken');
  }

  cookieStore.set('authSession', '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ success: true });
}
