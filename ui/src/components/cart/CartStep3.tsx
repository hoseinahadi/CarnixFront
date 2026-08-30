'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCartActionLoading } from '@/store/feature/cart/cartSelectors';
import { selectAddresses } from '@/store/feature/address/AddressSelectors';
import { placeOrderFromCart } from '@/store/feature/cart/cartThunks';
import axiosClient from '@/services/api/common/axiosClient';
import { CheckoutReferenceApi } from '@/features/checkout/api/referenceDataApi';
import styles from './CartStep3.module.scss';
import { calculateRoundedCartDiscount, calculateRoundedCartSubtotal, formatPrice, roundPrice } from '@/utils/price';

// ... (Interface ها مانند قبل باقی می‌مانند) ...
interface PaymentMethod {
  paymentMethodId: number;
  name: string;
  description: string;
  methodType: string;
  displayOrder: number;
  configurationJson: string;
}

interface CouponInfo {
  couponId: number;
  code: string;
  discountAmount: number;
  discountPercentage: number;
}

const CartStep3: React.FC<any> = ({ 
  cart, 
  onBack, 
  shippingMethod, 
  shippingCost,
  selectedAddressId 
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const actionLoading = useAppSelector(selectCartActionLoading);
  const addresses = useAppSelector(selectAddresses);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<number | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('ONLINE');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const selectedAddress = addresses.find(a => a.userAddressId === selectedAddressId);

  const itemsCount = cart?.totalItemsCount || cart?.items?.length || 0;
  const cartSubTotal = calculateRoundedCartSubtotal(cart);
  const cartDiscountTotal = calculateRoundedCartDiscount(cart);
  const roundedShippingCost = roundPrice(shippingCost || 0);
  const couponDiscountAmount = roundPrice(couponInfo?.discountAmount || 0);
  const finalAmount = Math.max(
    0,
    cartSubTotal - cartDiscountTotal + roundedShippingCost - couponDiscountAmount,
  );

  const formatCurrency = (amount: number) => formatPrice(amount);

  const getPaymentIcon = (methodType: string) => {
    switch (methodType) {
      case 'ONLINE': return '💳';
      case 'INSTALLMENT': return '🟣';
      case 'COD': return '🚪';
      default: return '💰';
    }
  };

  const shippingMethodLabels: Record<string, string> = {
    'post': 'پست پیشتاز',
    'tipax': 'تیپاکس',
    'peyk': 'پیک',
    'STANDARD': 'پست پیشتاز',
    'TIPAX': 'تیپاکس',
    'PICKUP': 'پیک'
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        // 🟢 استفاده از Axios بجای fetch برای ارسال اتوماتیک هدرها و توکن‌ها
        const response = await CheckoutReferenceApi.getPaymentMethods(); 
        const data = response.data;
        
        let methods: PaymentMethod[] = [];
        if (Array.isArray(data.data)) methods = data.data;
        else if (Array.isArray(data.mainResults)) methods = data.mainResults;

        if (methods.length > 0) {
          setPaymentMethods(methods);
          setSelectedPaymentMethodId(methods[0].paymentMethodId);
          setSelectedPaymentType(methods[0].methodType);
        }
      } catch (error) {
        console.error('خطا در دریافت روش‌های پرداخت:', error);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponMessage('');
    setErrorMessage('');
    
    try {
      // 🟢 اعمال کوپن با Axios
      const response = await axiosClient.get(`/Coupon/validate?code=${encodeURIComponent(couponCode)}`);
      const data = response.data;
      
      if (data.isSuccess && data.data) {
        setCouponInfo(data.data);
        setCouponMessage(data.message || 'کد تخفیف اعمال شد');
      } else {
        setCouponInfo(null);
        setErrorMessage(data.message || 'کد تخفیف نامعتبر است');
      }
    } catch (error) {
      setErrorMessage('خطا در اعمال کد تخفیف');
      setCouponInfo(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePayment = async () => {
    setErrorMessage('');
    
    if (!selectedAddress) {
      setErrorMessage('لطفاً به مرحله قبل برگشته و آدرس خود را انتخاب کنید.');
      return;
    }
    
    try {
      const orderData = {
        cartId: cart.cartId || cart.id,
        zipCode:  selectedAddress.postalCode || '',
        phoneNumber: selectedAddress.phoneNumber || '',
        destinationAddress: selectedAddress.fullAddress || '',
        recipientName: selectedAddress.recipientName  || '',
        city: selectedAddress.city || '',
        province: selectedAddress.province  || '',
        shippingMethod: shippingMethod,
        paymentMethod: selectedPaymentType,
        couponId: couponInfo?.couponId || null,
        notes: orderNotes
      };

      const result = await dispatch(placeOrderFromCart(orderData)).unwrap() as { orderId?: number; id?: number; paymentUrl?: string };
      
      if (result.paymentUrl) { 
        window.location.href = result.paymentUrl;
      } else if (result.orderId || result.id) {
        router.push(`/profile/orders/${result.orderId || result.id}/success`);
      }
      
    } catch (error: any) {
      setErrorMessage(typeof error === 'string' ? error : error?.message || 'خطا در ثبت سفارش');
    }
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>پرداخت</h3>
        <p className={styles.sectionSubtitle}>لطفاً شیوه پرداخت خود را انتخاب کنید</p>
      </div>

      <div className={styles.step3Container}>
        <div className={styles.mainSection}>
          
          {selectedAddress && (
            <div className={styles.selectedAddress}>
              <h3 className={styles.sectionTitle}>آدرس ارسال</h3>
              <div className={styles.addressCard}>
                <div className={styles.addressHeader}>
                  <span className={styles.addressTitle}>{selectedAddress.addressTitle}</span>
                </div>
                <div className={styles.addressDetail}>
                  <span className={styles.addressIcon}>📍</span>
                  {selectedAddress.fullAddress}
                </div>
                <div className={styles.addressMeta}>
                  <span>👤 {selectedAddress.recipientName}</span>
                  <span>📞 {selectedAddress.phoneNumber}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.selectedShipping}>
            <h3 className={styles.sectionTitle}>روش ارسال</h3>
            <div className={styles.shippingCard}>
              <span className={styles.shippingIcon}>🚚</span>
              <div className={styles.shippingInfo}>
                <span className={styles.shippingLabel}>
                  {shippingMethodLabels[shippingMethod] || shippingMethod}
                </span>
                <span className={styles.shippingPrice}>
                  {formatCurrency(roundedShippingCost)} تومان
                </span>
              </div>
            </div>
          </div>

          <div className={styles.paymentSection}>
            <h3 className={styles.sectionTitle}>شیوه پرداخت</h3>
            {loadingPaymentMethods ? (
              <div className={styles.loading}>در حال بارگذاری روش‌های پرداخت...</div>
            ) : (
              <div className={styles.paymentMethods}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.paymentMethodId}
                    className={`${styles.paymentMethod} ${selectedPaymentMethodId === method.paymentMethodId ? styles.selected : ''}`}
                    onClick={() => {
                      setSelectedPaymentMethodId(method.paymentMethodId);
                      setSelectedPaymentType(method.methodType);
                    }}
                  >
                    <div className={styles.methodIcon}>
                      {getPaymentIcon(method.methodType)}
                    </div>
                    <div className={styles.methodInfo}>
                      <div className={styles.methodName}>{method.name}</div>
                      <div className={styles.methodDescription}>{method.description}</div>
                    </div>
                    <div className={styles.radioCircle}>
                      {selectedPaymentMethodId === method.paymentMethodId && (
                        <div className={styles.radioInner} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.couponSection}>
            <h3 className={styles.sectionTitle}>کد تخفیف</h3>
            <div className={styles.couponInputGroup}>
              <input
                type="text"
                placeholder="کد تخفیف را وارد کنید"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!couponInfo}
                className={styles.couponInput}
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={!!couponInfo || !couponCode.trim() || couponLoading}
                className={styles.couponBtn}
              >
                {couponLoading ? '...' : couponInfo ? '✓ اعمال شد' : 'اعمال'}
              </button>
            </div>
            {couponMessage && <p className={styles.couponSuccess}>{couponMessage}</p>}
          </div>

          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>توضیحات سفارش</h3>
            <textarea
              placeholder="توضیحات تکمیلی خود را اینجا بنویسید..."
              className={styles.descriptionInput}
              rows={4}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryHeader}>
            <h3>جزئیات پرداخت</h3>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>تعداد کالا</span>
              <span>{itemsCount} عدد</span>
            </div>
            <div className={styles.summaryRow}>
              <span>مبلغ کالاها</span>
              <span>{formatCurrency(cartSubTotal)} تومان</span>
            </div>
            {cartDiscountTotal > 0 && (
              <div className={styles.summaryRow}>
                <span>تخفیف کالاها</span>
                <span className={styles.discount}>-{formatCurrency(cartDiscountTotal)} تومان</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>سود شما از خرید</span>
              {/* 🟢 باگ منطقی محاسبه سود اصلاح شد */}
              <span className={styles.profit}>{formatCurrency(cart.totalDiscount || 0)} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span>{formatCurrency(roundedShippingCost)} تومان</span>
            </div>
            {couponDiscountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span>تخفیف کوپن</span>
                <span className={styles.discount}>-{formatCurrency(couponDiscountAmount)} تومان</span>
              </div>
            )}
            <div className={styles.summaryDivider} />
            <div className={styles.summaryRowTotal}>
              <span>مبلغ قابل پرداخت</span>
              <span>{formatCurrency(finalAmount)} تومان</span>
            </div>
          </div>

          {errorMessage && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {errorMessage}
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.backBtn} onClick={onBack} disabled={actionLoading}>
              بازگشت
            </button>
            <button 
              className={styles.payBtn} 
              onClick={handlePayment}
              disabled={actionLoading || loadingPaymentMethods}
            >
              {actionLoading ? 'در حال پردازش...' : 'پرداخت و ثبت نهایی'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartStep3;