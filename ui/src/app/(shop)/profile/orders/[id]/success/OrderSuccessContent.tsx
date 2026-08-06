'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrderDetail } from '@/store/feature/orders/orderThunks';
import { selectSelectedOrder, selectOrderDetailLoading } from '@/store/feature/orders/orderSelectors';
import { clearSelectedOrder } from '@/store/feature/orders/orderSlice';
import styles from './OrderSuccess.module.scss';
import { IconCircleCheck, IconArrowRight, IconShoppingBag } from '@tabler/icons-react';

interface ComponentProps {
  params: Promise<{ id: string }>;
}

export default function OrderSuccessContent({ params }: ComponentProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const order = useAppSelector(selectSelectedOrder);
  const loading = useAppSelector(selectOrderDetailLoading);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(Number(id)));
    }

    return () => {
      dispatch(clearSelectedOrder());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(`/profile/orders/${id}`);
    }
  }, [countdown, router, id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p>در حال دریافت اطلاعات سفارش...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.iconWrapper}>
          <IconCircleCheck size={80} stroke={2} className={styles.successIcon} />
        </div>

        <h1 className={styles.title}>سفارش شما با موفقیت ثبت شد! 🎉</h1>
        <p className={styles.subtitle}>
          از اعتماد شما سپاسگزاریم. سفارش شما در حال پردازش است.
        </p>

        {order && (
          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>شماره سفارش:</span>
              <span className={styles.value}>{order.orderNumber}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>تاریخ ثبت:</span>
              <span className={styles.value}>
                {new Date(order.orderDate).toLocaleDateString('fa-IR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>مبلغ کل:</span>
              <span className={styles.price}>
                {new Intl.NumberFormat('fa-IR').format(order.grandTotal || 0)} تومان
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>وضعیت:</span>
              <span className={styles.statusPending}>در انتظار پردازش</span>
            </div>
          </div>
        )}

        <div className={styles.guideBox}>
          <IconShoppingBag size={24} />
          <div>
            <p className={styles.guideTitle}>چه اتفاقی می‌افتد؟</p>
            <p className={styles.guideText}>
              سفارش شما بررسی و بسته‌بندی خواهد شد. به محض ارسال، کد رهگیری برای شما پیامک می‌شود.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={() => router.push(`/profile/orders/${id}`)}
            className={styles.primaryBtn}
          >
            مشاهده جزئیات سفارش
            <IconArrowRight size={20} />
          </button>
          <button 
            onClick={() => router.push('/')}
            className={styles.secondaryBtn}
          >
            بازگشت به فروشگاه
          </button>
        </div>

        <p className={styles.countdown}>
          هدایت خودکار به صفحه سفارش تا <span>{countdown}</span> ثانیه دیگر...
        </p>
      </div>
    </div>
  );
}