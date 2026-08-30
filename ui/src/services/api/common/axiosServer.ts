import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080/api';

const DEFAULT_TIMEOUT_MS = 15_000;

interface TimedRequestConfig
  extends InternalAxiosRequestConfig {
  metadata?: {
    startedAt: number;
  };
}

const axiosServer = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

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

const getDuration = (
  config?: InternalAxiosRequestConfig,
): number | null => {
  const timedConfig =
    config as TimedRequestConfig | undefined;

  const startedAt =
    timedConfig?.metadata?.startedAt;

  return typeof startedAt === 'number'
    ? Date.now() - startedAt
    : null;
};

axiosServer.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig,
  ) => {
    const timedConfig =
      config as TimedRequestConfig;

    timedConfig.metadata = {
      startedAt: Date.now(),
    };

    const cookieStore = await cookies();

    const accessToken =
      cookieStore.get('token')?.value;

    const sessionId =
      cookieStore.get('sessionId')?.value;

    if (accessToken) {
      setRequestHeader(
        config,
        'Authorization',
        `ApiToken ${accessToken}`,
      );
    }

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

axiosServer.interceptors.response.use(
  (response) => {
    if (
      process.env.NODE_ENV ===
      'development'
    ) {
      const duration = getDuration(
        response.config,
      );

      console.info(
        `[API] ${response.config.method?.toUpperCase()} ${response.config.url} -> ${response.status}${
          duration !== null
            ? ` (${duration}ms)`
            : ''
        }`,
      );
    }

    return response;
  },
  (error: AxiosError) => {
    const duration = getDuration(
      error.config,
    );

    /*
     * بدنه پاسخ، Token، Stack Trace و اطلاعات کاربر Log نمی‌شوند.
     */
    console.error('[API] Request failed', {
      method:
        error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      code: error.code,
      durationMs: duration,
    });

    return Promise.reject(error);
  },
);

export default axiosServer;
