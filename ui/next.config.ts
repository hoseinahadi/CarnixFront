// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

// فعال‌سازی آنالایزر فقط زمانی که متغیر محیطی ANALYZE برابر با true باشد
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// فقط برای dev — SSL self-signed رو bypass می‌کنه
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  
  // تنظیمات images برای قبول عکس‌ها از هر دامنه‌ای
  images: {
    unoptimized: true,
  },
};

export default withBundleAnalyzer(nextConfig);