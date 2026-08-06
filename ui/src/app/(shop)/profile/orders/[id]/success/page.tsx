import { Suspense } from 'react';
import OrderSuccessContent from './OrderSuccessContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return [
    { id: '1' },
  ];
}

export default function OrderSuccessPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>در حال بارگذاری...</div>}>
      <OrderSuccessContent params={params} />
    </Suspense>
  );
}