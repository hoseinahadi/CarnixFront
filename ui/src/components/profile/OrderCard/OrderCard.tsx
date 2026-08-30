// src/components/profile/OrderCard/OrderCard.tsx
'use client'

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OrderDto } from '@/models/order/OrderDto';
import styles from './OrderCard.module.scss';
import { calculateTaxFreeOrderTotal, formatPrice } from '@/utils/price';
import { 
  IconChevronLeft, 
  IconChevronRight, 
  IconCircleCheck, 
  IconCircleX, 
  IconHourglassHigh 
} from '@tabler/icons-react';

interface OrderCardProps {
  order: OrderDto;
}

const getValidImageUrl = (rawUrl?: string) => {
  if (process.env.NODE_ENV === 'development') {
    return 'https://localhost:7191/uploads/products/111.png'; 
  }
  if (!rawUrl) return null;
  let cleanPath = rawUrl.replace(/^wwwroot[\\/]/i, '');
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7191';
  return `${backendBaseUrl}${cleanPath}`;
};

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const getStatusInfo = (statusId: number) => {
    if ([2, 5, 7, 10].includes(statusId)) return { label: 'تکمیل شده', className: styles.statusCompleted, icon: <IconCircleCheck size={20} /> };
    if ([8, 9].includes(statusId)) return { label: 'لغو شده', className: styles.statusCancelled, icon: <IconCircleX size={20} /> };
    // تغییر آیکون به ساعت شنی مطابق عکس
    return { label: 'جاری', className: styles.statusPending, icon: <IconHourglassHigh size={20} /> };
  };

  const status = getStatusInfo(order.orderStatusId);

  // خواندن تاریخ به صورت صحیح
  const dateString = order.createdAt || order.orderDate;
  const persianDate = dateString 
    ? new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : 'تاریخ نامشخص';

  const itemsList = order.items || [];
  
  const shippingMethod = order.shipments?.find(x => x.shippingMethodName)?.shippingMethodName || (order.shipments && order.shipments.length > 0 ? 'ارسال با پست' : 'پست پیشتاز');

  const scroll = (direction: 'right' | 'left') => {
    if (scrollRef.current) {
      const scrollAmount = 324; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={styles.card}>
      {/* --- ردیف بالا: وضعیت و دکمه جزییات --- */}
      <div className={styles.header}>
        {/* راست: وضعیت سفارش */}
        <div className={`${styles.status} ${status.className}`}>
          {/* در زبان راست‌چین، اِلمان اول در سمت راست قرار می‌گیرد */}
          {status.icon}
          <span>{status.label}</span>
        </div>
        
        {/* چپ: دکمه جزییات */}
        <button 
          onClick={() => router.push(`/profile/orders/${order.orderId}`)} 
          className={styles.detailBtn}
        >
          <span>جزییات سفارش</span>
          <IconChevronLeft size={18} stroke={2} />
        </button>
      </div>

      {/* --- ردیف وسط: اطلاعات سفارش --- */}
      <div className={styles.infoRow}>
        {/* برای حالت موبایل، کلاس‌های اختصاصی دادیم تا ترتیبشان عوض شود */}
        <div className={`${styles.infoItem} ${styles.mobileDate}`}>{persianDate}</div>
        <div className={`${styles.infoItem} ${styles.desktopOnly}`}>کد سفارش {order.orderNumber}</div>
        <div className={`${styles.infoItem} ${styles.mobileAmount}`}>مبلغ کل {formatPrice(calculateTaxFreeOrderTotal(order))} تومان</div>
        <div className={`${styles.infoItem} ${styles.desktopOnly}`}>ارسال با {shippingMethod}</div>
      </div>

      {/* خط جداکننده (فقط در موبایل نمایش داده می‌شود) */}
      <div className={styles.mobileDivider}></div>

      {/* --- ردیف پایین: اسلایدر عکس اقلام --- */}
      <div className={styles.galleryWrapper}>
        
        {itemsList.length > 4 && (
          <button className={styles.scrollBtn} onClick={() => scroll('right')} aria-label="بعدی">
            <IconChevronRight size={20} />
          </button>
        )}

        <div className={styles.sliderWindow} ref={scrollRef}>
          {itemsList.length > 0 ? (
            itemsList.map((item, idx) => {
              const currentImage = getValidImageUrl(item.imageUrl);
              
              return (
                <div key={idx} className={styles.imageWrapper}>
                  {currentImage ? (
                    <img 
                      src={currentImage} 
                      alt={item.productName || 'محصول'} 
                      className={styles.productImage} 
                      draggable={false} 
                    />
                  ) : (
                    <span className={styles.placeholder}>بدون تصویر</span>
                  )}
                </div>
              );
            })
          ) : (
            <span className={styles.emptyText}>بدون محصول</span>
          )}
        </div>

        {itemsList.length > 4 && (
          <button className={styles.scrollBtn} onClick={() => scroll('left')} aria-label="قبلی">
            <IconChevronLeft size={20} />
          </button>
        )}
        
      </div>
    </div>
  );
};

export default OrderCard;