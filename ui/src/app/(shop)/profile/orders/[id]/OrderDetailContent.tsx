// src/components/profile/OrderDetail/OrderDetailContent.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrderDetail, cancelOrder } from '@/store/feature/orders/orderThunks';
import {
  selectSelectedOrder,
  selectOrderDetailLoading,
  selectOrderActionLoading,
  selectOrderError
} from '@/store/feature/orders/orderSelectors';
import { clearSelectedOrder } from '@/store/feature/orders/orderSlice';
import { CheckoutReferenceApi } from '@/features/checkout/api/referenceDataApi';
import styles from './OrderDetail.module.scss';
import { calculateTaxFreeOrderTotal, formatPrice, roundPrice } from '@/utils/price';
import { toast } from 'react-hot-toast';
import {
  IconArrowLeft,
  IconTruck,
  IconPackage,
  IconCircleCheck,
  IconAlertTriangle,
  IconSettings,
  IconCopy,
  IconCircleX,
  IconClock,
  IconCar
} from '@tabler/icons-react';

interface ShippingMethod {
  shippingMethodId: number;
  name: string;
  code: string;
}

interface ComponentProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailContent({ params }: ComponentProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const dispatch = useAppDispatch();
  const router = useRouter();

  const order = useAppSelector(selectSelectedOrder);
  const loading = useAppSelector(selectOrderDetailLoading);
  const actionLoading = useAppSelector(selectOrderActionLoading);
  const error = useAppSelector(selectOrderError);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  useEffect(() => {
    if (!id) return;

    let active = true;
    dispatch(fetchOrderDetail(Number(id)));

    void CheckoutReferenceApi.getShippingMethods()
      .then((response) => {
        if (!active) return;
        let methods: ShippingMethod[] = [];
        if (response.data?.data) {
          if (Array.isArray(response.data.data)) methods = response.data.data;
          else if (response.data.data?.data && Array.isArray(response.data.data.data)) methods = response.data.data.data;
          else if (response.data.data?.mainResults && Array.isArray(response.data.data.mainResults)) methods = response.data.data.mainResults;
        } else if (response.data?.mainResults && Array.isArray(response.data.mainResults)) {
          methods = response.data.mainResults;
        }
        setShippingMethods(methods);
      })
      .catch((error) => {
        if (active) console.error('خطا در دریافت روش‌های ارسال:', error);
      });

    return () => {
      active = false;
      dispatch(clearSelectedOrder());
    };
  }, [id, dispatch]);

  const getShippingMethodName = (): string => {
    if (!order) return 'نامشخص';
    const shipment = order.shipments?.[0];
    if (shipment?.shippingMethodId) {
      const method = shippingMethods.find(m => m.shippingMethodId === shipment.shippingMethodId);
      if (method) return method.name;
    }
    if (shipment?.shippingMethodCode) {
      const codeMap: Record<string, string> = {
        'STANDARD': 'پست پیشتاز', 'POST': 'پست پیشتاز', 'TIPAX': 'تیپاکس', 'PEYK': 'پیک'
      };
      return codeMap[shipment.shippingMethodCode] || shipment.shippingMethodCode;
    }
    return 'پست پیشتاز';
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) return;
    try {
      await dispatch(cancelOrder({ id: Number(id), reason: cancelReason })).unwrap();
      setShowCancelModal(false);
    } catch (err) {
      console.error('خطا در لغو سفارش:', err);
    }
  };

  const handleReorder = () => {
    // 💡 TODO: متصل کردن به API سفارش مجدد / افزودن به سبد خرید
    toast('در حال پردازش سفارش مجدد...');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('کد رهگیری کپی شد');
  };

  const getStepLevel = (statusId: number) => {
    if ([8, 9, 10].includes(statusId)) return -1; 
    if ([1, 4].includes(statusId)) return 1; 
    if ([2, 3, 5].includes(statusId)) return 2; 
    if ([6].includes(statusId)) return 3; 
    if ([7].includes(statusId)) return 4; 
    return 1;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال دریافت اطلاعات سفارش...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.errorContainer}>
        <IconAlertTriangle size={48} className={styles.errorIcon} />
        <p>{error || 'سفارش یافت نشد.'}</p>
        <button onClick={() => router.push('/profile/orders')} className={styles.btnBackOutline}>بازگشت</button>
      </div>
    );
  }

  const stepLevel = getStepLevel(order.orderStatusId || 1);
  const isCancelled = stepLevel === -1;
  const shippingMethodName = getShippingMethodName();

  const dateString = order.createdAt || order.orderDate;
  const persianDate = dateString 
    ? new Date(dateString).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'نامشخص';
  const timeString = dateString 
    ? new Date(dateString).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={styles.container}>
      
      {/* ─── هدر (دسکتاپ و موبایل) ─── */}
      <div className={styles.pageHeader}>
        {/* موبایل */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTitleGroup}>
            <button onClick={() => router.push('/profile/orders')} className={styles.backIconBtn}>
              <IconArrowLeft size={20} stroke={2} />
            </button>
            <h1 className={styles.mobileTitle}>جزئیات سفارش</h1>
          </div>
          {!isCancelled && [1, 2, 4].includes(order.orderStatusId) && (
            <button onClick={() => setShowCancelModal(true)} className={styles.mobileCancelBtn} disabled={actionLoading}>
              لغو سفارش
            </button>
          )}
        </div>

        {/* دسکتاپ */}
        <div className={styles.desktopHeader}>
          <div>
            <h1 className={styles.desktopTitle}>جزئیات سفارش</h1>
            <div className={styles.breadcrumb}>
              پروفایل کاربر / سفارشات / سفارش {order.orderNumber}
            </div>
          </div>
          <div className={styles.desktopActions}>
            {!isCancelled && [1, 2, 4].includes(order.orderStatusId) && (
              <button onClick={() => setShowCancelModal(true)} className={styles.desktopCancelBtn} disabled={actionLoading}>
                لغو سفارش
              </button>
            )}
            <button onClick={handleReorder} className={styles.btnReorder}>
              سفارش مجدد
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        
        {/* ─── نوار وضعیت (Stepper) ─── */}
        {!isCancelled && (
          <div className={styles.stepperWrapper}>
            {/* مرحله 1 */}
            <div className={`${styles.step} ${stepLevel >= 1 ? styles.active : ''}`}>
              <div className={styles.stepIconBox}>
                <IconCircleCheck size={24} />
              </div>
              <span>دریافت سفارش</span>
            </div>
            
            <div className={`${styles.stepLine} ${stepLevel >= 2 ? styles.activeLine : ''}`}></div>
            
            {/* مرحله 2 */}
            <div className={`${styles.step} ${stepLevel >= 2 ? styles.active : ''}`}>
              <div className={styles.stepIconBox}>
                <IconSettings size={24} />
              </div>
              <span>پردازش</span>
            </div>

            <div className={`${styles.stepLine} ${stepLevel >= 3 ? styles.activeLine : ''}`}></div>
            
            {/* مرحله 3 */}
            <div className={`${styles.step} ${stepLevel >= 3 ? styles.active : ''}`}>
              <div className={styles.stepIconBox}>
                <IconPackage size={24} />
              </div>
              <span>بسته بندی</span>
            </div>

            <div className={`${styles.stepLine} ${stepLevel >= 4 ? styles.activeLine : ''}`}></div>
            
            {/* مرحله 4 */}
            <div className={`${styles.step} ${stepLevel >= 4 ? styles.active : ''}`}>
              <div className={styles.stepIconBox}>
                <IconTruck size={24} />
              </div>
              <span>ارسال شده</span>
            </div>
          </div>
        )}

        {/* ─── خلاصه سفارش ─── */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>خلاصه سفارش</h3>
          <div className={styles.summaryBox}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>کد سفارش</span>
                <span className={styles.value} dir="ltr">{order.orderNumber}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>تاریخ سفارش</span>
                <span className={styles.value}>{persianDate} - {timeString}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>مبلغ کل</span>
                <span className={styles.value}>{formatPrice(calculateTaxFreeOrderTotal(order))} تومان</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>ارسال با</span>
                <span className={styles.value}>{shippingMethodName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── محصولات سفارش داده شده ─── */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>محصولات سفارش داده شده</h3>
          
          {/* حالت موبایل (لیست) */}
          <div className={styles.mobileProductsList}>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productImgBox}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <IconPackage className={styles.placeholder} />}
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productName}>
                    {item.productName} <span className={styles.qtyText}>× {item.quantity}</span>
                  </h4>
                  <div className={styles.carModel}>
                    <IconCar size={16} stroke={1.5} />
                    <span>{item.vehicleModel || '۲۰۷'}</span>
                  </div>
                  <div className={styles.productPrice}>
                    {formatPrice(item.unitPrice)} تومان
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* حالت دسکتاپ (جدول) */}
          <div className={styles.desktopProductsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>تعداد</th>
                  <th>قیمت</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.tdProduct}>
                        <div className={styles.tdImgBox}>
                          {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} /> : <IconPackage />}
                        </div>
                        <div className={styles.tdInfo}>
                          <span className={styles.tdName}>{item.productName}</span>
                          <div className={styles.carModel}>
                            <IconCar size={16} /> <span>{item.vehicleModel || '۲۰۷'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><div className={styles.tdQty}>{item.quantity} عدد</div></td>
                    <td><div className={styles.tdPrice}>{formatPrice(roundPrice(item.unitPrice) * item.quantity)} تومان</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── اطلاعات ارسال ─── */}
        <div className={styles.sectionBlock}>
          <h3 className={styles.sectionTitle}>اطلاعات ارسال</h3>
          <div className={styles.shippingBox}>
            
            <div className={styles.shippingRowFlex}>
              <div className={styles.shipItem}>
                <span className={styles.label}>گیرنده: </span>
                <span className={styles.value}>{ 'ثبت نشده'}</span>
              </div>
              <div className={styles.shipItem}>
                <span className={styles.label}>شماره تماس: </span>
                <span className={styles.value} dir="ltr">{ 'ثبت نشده'}</span>
              </div>
              <div className={styles.shipItem}>
                <span className={styles.label}>کد پستی: </span>
                <span className={styles.value} dir="ltr">{ 'ثبت نشده'}</span>
              </div>
            </div>

            <div className={styles.shippingRow}>
              <span className={styles.label}>آدرس: </span>
              <p className={styles.addressText}>
                {order.shipments?.[0]?.destinationAddress || 'آدرس ثبت نشده است.'}
              </p>
            </div>

            <div className={styles.shippingRow}>
              <span className={styles.label}>توضیحات کاربر: </span>
              <p className={styles.addressText}>
                {'توضیحاتی ثبت نشده است.'}
              </p>
            </div>

            {order.shipments?.[0]?.trackingNumber && (
              <div className={styles.trackingRow}>
                <span className={styles.label}>کد رهگیری پست: </span>
                <div className={styles.trackingCodeBox}>
                  <button onClick={() => copyToClipboard(order.shipments![0].trackingNumber!)} className={styles.copyBtn}>
                    <IconCopy size={18} />
                  </button>
                  <span className={styles.trackingNumber} dir="ltr">{order.shipments[0].trackingNumber}</span>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* ─── Modal لغو سفارش ─── */}
      {showCancelModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCancelModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>لغو سفارش</h3>
              <button className={styles.closeBtn} onClick={() => setShowCancelModal(false)}>
                <IconCircleX size={24} />
              </button>
            </div>
            <p className={styles.modalSubtitle}>دلیل لغو سفارش خود را بنویسید:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={styles.modalTextarea}
              rows={4}
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowCancelModal(false)} className={styles.modalCancelBtn}>انصراف</button>
              <button onClick={handleCancelOrder} disabled={!cancelReason.trim() || actionLoading} className={styles.modalConfirmBtn}>
                {actionLoading ? 'در حال لغو...' : 'تایید لغو سفارش'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}