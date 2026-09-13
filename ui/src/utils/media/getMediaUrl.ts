import { backendOrigin } from '@/config/runtime';

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

  // Assets shipped with the Next.js app live in /public and must stay on the
  // frontend origin; backend media paths continue through backendOrigin below.
  if (cleanPath.startsWith('/figma-assets/') || cleanPath.startsWith('/images/')) {
    return cleanPath;
  }

  if (cleanPath.startsWith('/')) {
    return `${backendOrigin}${cleanPath}`;
  }

  return `${backendOrigin}/${cleanPath}`;
};
