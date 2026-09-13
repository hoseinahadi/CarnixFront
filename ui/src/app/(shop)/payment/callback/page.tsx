'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import AsyncState from '@/components/common/AsyncState/AsyncState';
import { PaymentApi } from '@/features/checkout/api/paymentApi';
import { useAppDispatch } from '@/store/hooks';
import { fetchMyCart } from '@/store/feature/cart/cartThunks';

type Result = { status: 'loading' | 'success' | 'error'; message: string; orderId?: number };

export default function PaymentCallbackPage() {
  const started = useRef(false);
  const dispatch = useAppDispatch();
  const [result, setResult] = useState<Result>({ status: 'loading', message: 'در حال بررسی نتیجه پرداخت…' });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const params = new URLSearchParams(window.location.search);
    const rawPending = sessionStorage.getItem('carnix:pending-payment');
    let pending: { paymentId?: number; orderId?: number; gatewayToken?: string } = {};
    try { pending = rawPending ? JSON.parse(rawPending) : {}; } catch { /* invalid state is handled below */ }
    const paymentId = Number(params.get('paymentId') || pending.paymentId);
    const orderId = Number(params.get('orderId') || pending.orderId);
    const transactionReference = params.get('transactionReference') || params.get('refId') || '';
    const gatewayToken = params.get('token') || params.get('authority') || pending.gatewayToken || '';
    const gatewayStatus = params.get('status');

    if (gatewayStatus && !['ok', 'success', '1'].includes(gatewayStatus.toLowerCase())) {
      queueMicrotask(() => setResult({ status: 'error', message: 'پرداخت توسط درگاه لغو یا ناموفق اعلام شد.', orderId }));
      return;
    }
    if (!paymentId || !transactionReference) {
      queueMicrotask(() => setResult({ status: 'error', message: 'اطلاعات بازگشتی درگاه کامل نیست.', orderId }));
      return;
    }

    void PaymentApi.verify({ paymentId, transactionReference, gatewayToken })
      .then(async (response) => {
        if (!response.data?.isSuccess) throw new Error(response.data?.message || 'تأیید پرداخت ناموفق بود.');
        await dispatch(fetchMyCart({ force: true }));
        sessionStorage.removeItem('carnix:pending-payment');
        sessionStorage.removeItem('carnix:checkout:v1');
        setResult({ status: 'success', message: response.data.message || 'پرداخت با موفقیت تأیید شد.', orderId: response.data.data?.orderId || orderId });
      })
      .catch((error: unknown) => setResult({ status: 'error', message: error instanceof Error ? error.message : 'امکان تأیید پرداخت وجود ندارد.', orderId }));
  }, [dispatch]);

  if (result.status === 'loading') return <AsyncState status="loading" title={result.message} />;
  if (result.status === 'error') return <AsyncState status="error" title="پرداخت تأیید نشد" description={result.message} actionHref={result.orderId ? `/profile/orders/${result.orderId}` : '/profile/orders'} actionLabel="مشاهده سفارش‌ها" />;
  return <section role="status"><h1>پرداخت موفق</h1><p>{result.message}</p><Link href={result.orderId ? `/profile/orders/${result.orderId}/success` : '/profile/orders'}>مشاهده سفارش</Link></section>;
}
