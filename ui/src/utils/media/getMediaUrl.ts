const stripApiSuffix = (value: string): string =>
  value.replace(/\/api\/?$/i, '').replace(/\/$/, '');

const getBackendOrigin = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'https://api.carnix.ir';

  return stripApiSuffix(configured.trim());
};

export const getMediaUrl = (
  rawUrl?: string | null,
): string | null => {
  if (!rawUrl?.trim()) {
    return null;
  }

  const value = rawUrl.trim();

  if (
    value.startsWith('data:') ||
    value.startsWith('blob:') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  const cleanPath = value
    .replace(/^wwwroot[\\/]/i, '')
    .replace(/\\/g, '/');

  if (cleanPath.startsWith('/')) {
    return `${getBackendOrigin()}${cleanPath}`;
  }

  return `${getBackendOrigin()}/${cleanPath}`;
};
