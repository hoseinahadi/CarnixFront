import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  ApiBusinessError,
  isDefinitiveAuthenticationError,
  isOperationResult,
  isRequestCanceled,
} from '@/services/api/common/apiError';

import {
  clearAuthStorage,
  extractAuthTokens,
  getAccessToken,
  getOrCreateSessionId,
  getRefreshToken,
  saveAuthTokens,
  type AuthTokens,
} from '@/services/api/common/authTokenStorage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080/api';

const DEFAULT_TIMEOUT_MS = 15_000;

interface RetryableRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type AuthFailureCallback = () => void;

const authFailureCallbacks =
  new Set<AuthFailureCallback>();

let refreshPromise: Promise<AuthTokens> | null = null;
let authFailureNotified = false;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/*
 * Refresh با Client جدا اجرا می‌شود تا Interceptor همین فایل
 * دوباره روی Endpoint Refresh فعال نشود و Loop ایجاد نکند.
 */
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const setAuthFailureCallback = (
  callback: AuthFailureCallback,
): (() => void) => {
  authFailureCallbacks.add(callback);

  return () => {
    authFailureCallbacks.delete(callback);
  };
};

const notifyAuthFailure = (): void => {
  if (authFailureNotified) {
    return;
  }

  authFailureNotified = true;

  authFailureCallbacks.forEach(
    (callback) => {
      try {
        callback();
      } catch {
        // خطای یک Listener نباید بقیه Listenerها را متوقف کند.
      }
    },
  );

  if (
    authFailureCallbacks.size === 0 &&
    typeof window !== 'undefined'
  ) {
    const callbackUrl = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`,
    );

    window.location.assign(
      `/login?callbackUrl=${callbackUrl}`,
    );
  }
};

const resetAuthFailureNotification = (): void => {
  authFailureNotified = false;
};

const setRequestHeader = (
  config: InternalAxiosRequestConfig,
  name: string,
  value: string,
): void => {
  if (!(config.headers instanceof AxiosHeaders)) {
    config.headers = new AxiosHeaders(
      config.headers,
    );
  }

  config.headers.set(name, value);
};

const isAuthEndpoint = (
  url?: string,
): boolean => {
  if (!url) {
    return false;
  }

  return [
    '/Auth/login',
    '/Auth/refresh',
    '/Auth/send-otp',
    '/Auth/verify-otp',
    '/Auth/register',
    '/Auth/logout',
  ].some((endpoint) =>
    url.includes(endpoint),
  );
};

const readRefreshBusinessError = (
  payload: unknown,
): ApiBusinessError | null => {
  if (
    !isOperationResult<unknown>(payload) ||
    payload.isSuccess
  ) {
    return null;
  }

  return new ApiBusinessError(
    payload.message ||
      'نشست کاربری قابل تمدید نیست.',
    payload.statusCode ?? 401,
    payload.errors ?? null,
  );
};

const refreshAccessToken = async (): Promise<AuthTokens> => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken || !refreshToken) {
    throw new ApiBusinessError(
      'اطلاعات ورود کامل نیست.',
      401,
    );
  }

  const response = await refreshClient.post(
    '/Auth/refresh',
    {
      accessToken,
      refreshToken,
    },
  );

  const businessError =
    readRefreshBusinessError(
      response.data,
    );

  if (businessError) {
    throw businessError;
  }

  const refreshedTokens =
    extractAuthTokens(response.data);

  if (!refreshedTokens) {
    throw new ApiBusinessError(
      'پاسخ تمدید نشست معتبر نیست.',
      401,
    );
  }

  saveAuthTokens(refreshedTokens);
  resetAuthFailureNotification();

  return refreshedTokens;
};

const getRefreshedTokens = (): Promise<AuthTokens> => {
  if (!refreshPromise) {
    refreshPromise =
      refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosClient.interceptors.request.use(
  (
    config: InternalAxiosRequestConfig,
  ) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      setRequestHeader(
        config,
        'Authorization',
        `ApiToken ${accessToken}`,
      );
    }

    const sessionId = getOrCreateSessionId();

    if (sessionId) {
      setRequestHeader(
        config,
        'X-Session-Id',
        sessionId,
      );
    }

    return config;
  },
  (error: unknown) =>
    Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    if (isRequestCanceled(error)) {
      return Promise.reject(error);
    }

    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken || !refreshToken) {
      clearAuthStorage();
      notifyAuthFailure();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshedTokens =
        await getRefreshedTokens();

      setRequestHeader(
        originalRequest,
        'Authorization',
        `ApiToken ${refreshedTokens.accessToken}`,
      );

      return await axiosClient(
        originalRequest,
      );
    } catch (refreshError: unknown) {
      /*
       * در خطای شبکه یا Timeout کاربر Logout نمی‌شود؛ چون ممکن است
       * Token سالم باشد و فقط سرور موقتاً در دسترس نباشد.
       */
      if (
        isDefinitiveAuthenticationError(
          refreshError,
        )
      ) {
        clearAuthStorage();
        notifyAuthFailure();
      }

      return Promise.reject(
        refreshError,
      );
    }
  },
);

export default axiosClient;
