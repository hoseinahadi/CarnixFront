/*
 * Cleanup service worker for legacy registrations.
 * این پروژه PWA نیست؛ اگر مرورگر از نسخه‌های قبلی /sw.js ثبت کرده باشد،
 * این worker خودش را حذف می‌کند تا درخواست 404 و cache قدیمی باقی نماند.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
