import Cookies from 'js-cookie';

import type { UserDetail } from '@/models/user/UserDetail';

const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const SESSION_ID_KEY = 'sessionId';

const ACCESS_TOKEN_COOKIE_DAYS = 7;
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
  if (!canUseBrowserStorage()) {
    return null;
  }

  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    Cookies.get(ACCESS_TOKEN_KEY) ||
    null
  );
};

export const getRefreshToken = (): string | null => {
  if (!canUseBrowserStorage()) {
    return null;
  }

  /*
   * خواندن Cookie فقط برای مهاجرت Sessionهای قدیمی نگه داشته شده است.
   * ذخیره جدید Refresh Token فقط در localStorage انجام می‌شود تا حداقل
   * نسخه تکراری و JavaScript-readable آن داخل Cookie ایجاد نشود.
   * انتقال کامل Refresh Token به HttpOnly Cookie نیازمند تغییر بک‌اند است.
   */
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    Cookies.get(REFRESH_TOKEN_KEY) ||
    null
  );
};

export const saveAuthTokens = ({
  accessToken,
  refreshToken,
}: AuthTokens): void => {
  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken,
  );

  Cookies.set(
    ACCESS_TOKEN_KEY,
    accessToken,
    getCookieOptions(
      ACCESS_TOKEN_COOKIE_DAYS,
    ),
  );

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken,
    );

    /*
     * اگر نسخه قدیمی Refresh Token داخل Cookie وجود داشته باشد، حذف می‌شود.
     * axiosClient برای Refresh از localStorage استفاده می‌کند.
     */
    Cookies.remove(
      REFRESH_TOKEN_KEY,
      { path: '/' },
    );
  }
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

  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );
  localStorage.removeItem(
    REFRESH_TOKEN_KEY,
  );
  localStorage.removeItem(USER_KEY);

  Cookies.remove(
    ACCESS_TOKEN_KEY,
    { path: '/' },
  );
  Cookies.remove(
    REFRESH_TOKEN_KEY,
    { path: '/' },
  );
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
