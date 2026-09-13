'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductReviews from '@/components/product/ProductReviews/ProductReviews';

export default function ProfileCommentsPage() {
  return <Suspense fallback={<CommentsFallback />}><ProfileCommentsContent /></Suspense>;
}

function ProfileCommentsContent() {
  const params = useSearchParams();
  const productId = Number(params.get('productId'));

  if (!Number.isInteger(productId) || productId <= 0) {
    return (
      <main dir="rtl" style={{ padding: 32 }}>
        <h1>نظرات محصولات</h1>
        <p>برای ثبت یا ویرایش نظر، از صفحه همان محصول وارد بخش نظرات شوید.</p>
      </main>
    );
  }

  return <ProductReviews productId={productId} />;
}

function CommentsFallback() {
  return <main dir="rtl" style={{ padding: 32 }} aria-busy="true">در حال آماده‌سازی نظرات محصولات...</main>;
}
