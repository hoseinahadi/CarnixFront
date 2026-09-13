'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    const traceId = error.digest || crypto.randomUUID();
    console.error('[UI] Unhandled route error', { traceId, message: error.message });
  }, [error]);

  return (
    <main style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }} dir="rtl">
      <section>
        <h1>مشکلی پیش آمد</h1>
        <p>بارگذاری این صفحه ناموفق بود. دوباره تلاش کنید.</p>
        <button type="button" onClick={() => reset()}>تلاش دوباره</button>
      </section>
    </main>
  );
}
