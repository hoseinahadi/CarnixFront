const DEFAULT_BACKEND_ORIGIN = 'https://localhost:7191';
const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const backendOrigin = trimTrailingSlash(
  process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/i, '') ??
    DEFAULT_BACKEND_ORIGIN,
);
export const backendApiUrl = `${backendOrigin}/api`;
export const browserApiUrl = '/api/backend';
export const apiTimeoutMs = 15_000;
