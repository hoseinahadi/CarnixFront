import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { apiTimeoutMs, backendApiUrl } from '@/config/runtime';
import { localHttpsAgent } from '@/services/api/common/localHttpsAgent';
import { repairMojibake } from '@/utils/text/repairMojibake';

const readToken = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const extractTokens = (payload: unknown) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const record = payload as Record<string, unknown>;
  const nested = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : null;
  const accessToken = readToken(record.accessToken) ?? readToken(record.token) ?? readToken(nested?.accessToken) ?? readToken(nested?.token);
  const refreshToken = readToken(record.refreshToken) ?? readToken(nested?.refreshToken);
  const expiresInSeconds = Number(record.expiresInSeconds ?? nested?.expiresInSeconds ?? ACCESS_TOKEN_MAX_AGE_SECONDS);
  return accessToken && refreshToken ? { accessToken, refreshToken, expiresInSeconds: Number.isFinite(expiresInSeconds) ? expiresInSeconds : ACCESS_TOKEN_MAX_AGE_SECONDS } : null;
};

export async function POST() {
  const traceId = crypto.randomUUID();
  const withTrace = (body: unknown, init?: ResponseInit) =>
    NextResponse.json(body, {
      ...init,
      headers: { ...(init?.headers ?? {}), 'X-Trace-Id': traceId },
    });
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) {
    return withTrace({ isSuccess: false, message: 'نشست قابل تمدید نیست.' }, { status: 401 });
  }

  try {
    const response = await axios.post(
      `${backendApiUrl}/Auth/refresh`,
      { refreshToken },
      { adapter: 'http', timeout: apiTimeoutMs, httpsAgent: localHttpsAgent, validateStatus: () => true },
    );
    const payload = repairMojibake(response.data) as Record<string, unknown>;
    const tokens = response.status >= 200 && response.status < 300 ? extractTokens(payload) : null;
    if (!tokens) {
      const status = response.status >= 400 && response.status < 500 ? 401 : response.status || 502;
      return withTrace({ isSuccess: false, message: typeof payload?.message === 'string' ? payload.message : 'نشست قابل تمدید نیست.' }, { status });
    }

    const secure = process.env.NODE_ENV === 'production';
    cookieStore.set('token', tokens.accessToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: tokens.expiresInSeconds });
    cookieStore.set('refreshToken', tokens.refreshToken, { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS });
    // این کوکی فقط نشانگر وجود نشست است و نباید با عمر access token منقضی شود.
    cookieStore.set('authSession', '1', { httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS });

    return withTrace({ isSuccess: true, data: { expiresInSeconds: tokens.expiresInSeconds }, message: 'نشست با موفقیت تمدید شد.' });
  } catch {
    return withTrace({ isSuccess: false, message: 'ارتباط با سرویس احراز هویت برقرار نشد.' }, { status: 502 });
  }
}
