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
  getAccessToken,
  getOrCreateSessionId,
  markHttpOnlySession,
  HTTP_ONLY_SESSION_MARKER,
  type AuthTokens,
} from '@/services/api/common/authTokenStorage';
import { apiTimeoutMs, backendApiUrl, browserApiUrl } from '@/config/runtime';
import { repairMojibake } from '@/utils/text/repairMojibake';

const API_BASE_URL = typeof window === 'undefined' ? backendApiUrl : browserApiUrl;
const DEFAULT_TIMEOUT_MS = apiTimeoutMs;

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
  baseURL: '/',
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
    '/api/auth/refresh',
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
  if (!getAccessToken()) {
    throw new ApiBusinessError(
      'نشست کاربری یافت نشد.',
      401,
    );
  }

  const response = await refreshClient.post('/api/auth/refresh');

  const businessError =
    readRefreshBusinessError(
      response.data,
    );

  if (businessError) {
    throw businessError;
  }

  if (!response.data?.isSuccess) {
    throw new ApiBusinessError('پاسخ تمدید نشست معتبر نیست.', 401);
  }

  // توکن‌ها در HttpOnly cookie توسط Route Handler ذخیره شده‌اند.
  markHttpOnlySession();
  resetAuthFailureNotification();
  return { accessToken: HTTP_ONLY_SESSION_MARKER };
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
  (response) => { response.data = repairMojibake(response.data); return response; },

  async (error: AxiosError) => {
    if (isRequestCanceled(error)) {
      return Promise.reject(error);
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Request failed', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        traceId: error.response?.headers?.['x-trace-id'],
      });
    }

    const originalRequest =
      error.config as
        | RetryableRequestConfig
        | undefined;

    if (
      ![401, 403].includes(error.response?.status ?? 0) ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (!getAccessToken()) {
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
