import Cookies from 'js-cookie';

import type { UserDetail } from '@/models/user/UserDetail';
import {
  invalidateRequestCache,
  setRequestCacheIdentity,
} from '@/services/api/common/requestCache';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const SESSION_ID_KEY = 'sessionId';
/** فقط یک نشانگر قابل‌نمایش در state/UI؛ هرگز یک توکن واقعی نیست. */
export const HTTP_ONLY_SESSION_MARKER = '__http_only_session__';

let accessTokenInMemory: string | null = null;
let refreshTokenInMemory: string | null = null;
const SESSION_COOKIE_DAYS = 30;

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

const canUseBrowserStorage = (): boolean =>
  typeof window !== 'undefined';

const getCookieOptions = (
  expires: number,
) => ({
  expires,
  path: '/',
  sameSite: 'lax' as const,
  secure:
    canUseBrowserStorage() &&
    window.location.protocol === 'https:',
});

export const getAccessToken = (): string | null => {
  if (!canUseBrowserStorage()) return null;
  return accessTokenInMemory ?? (Cookies.get('authSession') ? HTTP_ONLY_SESSION_MARKER : null);
};

export const getRefreshToken = (): string | null => refreshTokenInMemory;

/** پس از تمدید از مسیر سرور، توکن خام از حافظهٔ جاوااسکریپت حذف می‌شود. */
export const markHttpOnlySession = (): void => {
  accessTokenInMemory = null;
  refreshTokenInMemory = null;
};

export const saveAuthTokens = async ({ accessToken, refreshToken }: AuthTokens): Promise<void> => {
  if (!canUseBrowserStorage()) return;
  if (accessTokenInMemory !== accessToken) invalidateRequestCache();
  accessTokenInMemory = accessToken;
  refreshTokenInMemory = refreshToken ?? null;
  removeLegacyTokenArtifacts();
  const response = await fetch('/api/auth/set-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ token: accessToken, refreshToken }),
  });
  if (!response.ok) {
    throw new Error('ذخیره امن نشست انجام نشد.');
  }
};

/** مهاجرت یک‌بارهٔ نشست‌های قدیمی که توکن را در Storage قابل‌خواندن نگه می‌داشتند. */
export const removeLegacyTokenArtifacts = (): void => {
  if (!canUseBrowserStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

export const saveUserSnapshot = (
  user: UserDetail,
): void => {
  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user),
  );
  setRequestCacheIdentity(`user:${user.userId}`);
};

export const getUserSnapshot = (): UserDetail | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const serializedUser =
    localStorage.getItem(USER_KEY);

  if (!serializedUser) {
    return null;
  }

  try {
    return JSON.parse(
      serializedUser,
    ) as UserDetail;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

export const clearAuthStorage = (): void => {
  if (!canUseBrowserStorage()) {
    return;
  }

  // cacheهای شخصی مثل wishlist/profile/address بین کاربران باقی نمانند.
  invalidateRequestCache();
  setRequestCacheIdentity('anonymous');
  accessTokenInMemory = null;
  refreshTokenInMemory = null;

  removeLegacyTokenArtifacts();
  localStorage.removeItem(USER_KEY);

  Cookies.remove('authSession', { path: '/' });
  void fetch('/api/auth/clear-tokens', { method: 'POST', credentials: 'same-origin' });
};

export const getOrCreateSessionId = (): string | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  const existingSessionId =
    localStorage.getItem(SESSION_ID_KEY);

  if (existingSessionId) {
    return existingSessionId;
  }

  const sessionId =
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`;

  localStorage.setItem(
    SESSION_ID_KEY,
    sessionId,
  );

  Cookies.set(
    SESSION_ID_KEY,
    sessionId,
    getCookieOptions(
      SESSION_COOKIE_DAYS,
    ),
  );

  return sessionId;
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const readToken = (
  value: unknown,
): string | null =>
  typeof value === 'string' &&
  value.trim().length > 0
    ? value.trim()
    : null;

/**
 * پاسخ‌های فعلی بک‌اند ممکن است Token را مستقیم یا داخل data برگردانند.
 * این تابع هر دو شکل و نام‌های token/accessToken را پشتیبانی می‌کند.
 */
export const extractAuthTokens = (
  payload: unknown,
): AuthTokens | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const directAccessToken =
    readToken(payload.token) ??
    readToken(payload.accessToken);

  const directRefreshToken =
    readToken(payload.refreshToken);

  if (directAccessToken) {
    return {
      accessToken: directAccessToken,
      refreshToken:
        directRefreshToken ?? undefined,
    };
  }

  if ('data' in payload) {
    return extractAuthTokens(payload.data);
  }

  return null;
};
