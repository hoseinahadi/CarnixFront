// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// فعال‌سازی آنالایزر فقط زمانی که متغیر محیطی ANALYZE برابر با true باشد
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// فقط برای dev — SSL self-signed رو bypass می‌کنه


const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
      ],
    }];
  },
  
  // تصاویر API با فرمت‌های مدرن و کش داخلی Next بهینه می‌شوند.
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [32, 48, 64, 72, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost', port: '7191', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'localhost', port: '7191', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
