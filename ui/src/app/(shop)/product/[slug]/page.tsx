import ProductDetailPage from '@/views/ProductDetail/ProductDetail';
import React from 'react'

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  // اگر نیاز به SSR دیتا فچینگ دارید، اینجا انجام می‌دهید و به عنوان پراپس پاس می‌دهید
  return (
    <main>
       <ProductDetailPage params={params} /> 
    </main>
  );
}
