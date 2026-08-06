import { Suspense } from 'react';
import OrderDetailContent from './OrderDetailContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

// این تابع برای خروجی استاتیک الزامی است
export async function generateStaticParams() {
  return [
    { id: '1' },
  ];
}

export default function OrderDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>در حال دریافت اطلاعات سفارش...</div>}>
      <OrderDetailContent params={params} />
    </Suspense>
  );
}