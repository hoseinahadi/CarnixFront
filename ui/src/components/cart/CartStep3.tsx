'use client';

import React, { useState } from 'react';
import styles from './CartStep3.module.scss';

interface CartStep3Props {
  cart: any;
  onBack: () => void;
}

const CartStep3: React.FC<CartStep3Props> = ({ cart, onBack }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('online');
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponApplied, setCouponApplied] = useState<boolean>(false);

  // --- محاسبه مجموع قیمت اقلام از روی آیتم‌ها (به تومان) ---
  const cartTotalInToman = cart?.items?.reduce((sum: number, item: any) => {
    const itemPrice = item.price || item.unitPrice || 0;
    return sum + itemPrice * item.quantity;
  }, 0) || 0;

  const itemsCount = cart?.totalItemsCount || cart?.items?.length || 0;

  // هزینه ارسال (در عمل باید از مرحله قبل بیاید، اینجا ثابت گذاشته شده)
  const shippingCost = 220000; // به تومان

  // مبلغ تخفیف کوپن (در صورت اعمال)
  const discountAmount = couponApplied ? 100000 : 0;

  // مبلغ نهایی قابل پرداخت
  const finalAmount = cartTotalInToman + shippingCost - discountAmount;

  // سود شما از خرید (میتواند به‌صورت داینامیک محاسبه شود در صورت وجود قیمت اصلی)
  const yourProfit = 635000;

  // --- محاسبه اقساط ۴ ماهه بر اساس مبلغ نهایی ---
  const installmentCount = 4;
  const monthlyPayment = Math.floor(finalAmount / installmentCount);
  const firstPayment = finalAmount - (monthlyPayment * (installmentCount - 1));

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fa-IR');
  };

  // روش‌های پرداخت
  const paymentMethods = [
    { 
      id: 'online', 
      label: 'پرداخت اینترنتی', 
      description: 'پرداخت با کارت‌های عضو شتاب',
      icon: '💳'
    },
    { 
      id: 'snapp', 
      label: 'پرداخت اقساطی اسنپ پی', 
      description: `۴ قسط بدون کارمزد (قسط اول: ${formatCurrency(firstPayment)} تومان + ۳ قسط ${formatCurrency(monthlyPayment)} تومان)`,
      icon: '🟣'
    },
    { 
      id: 'door', 
      label: 'پرداخت درب منزل', 
      description: 'فقط برای تهران و همدان',
      icon: '🚪'
    },
  ];

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  const handlePayment = () => {
    alert(`پرداخت با روش ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}`);
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>پرداخت</h3>
        <p className={styles.sectionSubtitle}>لطفاً شیوه پرداخت خود را انتخاب کنید</p>
      </div>

      <div className={styles.step3Container}>
        
        {/* سمت راست: محتوای اصلی */}
        <div className={styles.mainSection}>
          {/* بخش روش‌های پرداخت */}
          <div className={styles.paymentSection}>
            <h3 className={styles.sectionTitle}>شیوه پرداخت</h3>
            <div className={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`${styles.paymentMethod} ${selectedPaymentMethod === method.id ? styles.selected : ''}`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className={styles.methodIcon}>{method.icon}</div>
                  <div className={styles.methodInfo}>
                    <div className={styles.methodName}>{method.label}</div>
                    <div className={styles.methodDescription}>{method.description}</div>
                  </div>
                  <div className={styles.radioCircle}>
                    {selectedPaymentMethod === method.id && <div className={styles.radioInner} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* بخش کوپن تخفیف */}
          <div className={styles.couponSection}>
            <h3 className={styles.sectionTitle}>کد تخفیف</h3>
            <p className={styles.sectionSubtitle}>در صورت داشتن کد تخفیف، آن را وارد کنید</p>
            <div className={styles.couponInputGroup}>
              <input
                type="text"
                placeholder="کد تخفیف را وارد کنید"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied}
                className={styles.couponInput}
              />
              <button 
                onClick={handleApplyCoupon}
                disabled={couponApplied || !couponCode.trim()}
                className={styles.couponBtn}
              >
                {couponApplied ? 'اعمال شد ✓' : 'اعمال'}
              </button>
            </div>
            {couponApplied && (
              <p className={styles.couponSuccess}>کد تخفیف با موفقیت اعمال شد (-۱۰۰,۰۰۰ تومان)</p>
            )}
          </div>

          

          {/* بخش توضیحات */}
          <div className={styles.descriptionSection}>
            <h3 className={styles.sectionTitle}>توضیحات سفارش</h3>
            <textarea
              placeholder="توضیحات تکمیلی خود را اینجا بنویسید..."
              className={styles.descriptionInput}
              rows={4}
            />
          </div>
        </div>

        {/* سمت چپ: خلاصه سفارش */}
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
              <span>{formatCurrency(cartTotalInToman)} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>سود شما از خرید</span>
              <span className={styles.profit}>{formatCurrency(yourProfit)} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span>{formatCurrency(shippingCost)} تومان</span>
            </div>
            {couponApplied && (
              <div className={styles.summaryRow}>
                <span>کد تخفیف</span>
                <span className={styles.discount}>-{formatCurrency(discountAmount)} تومان</span>
              </div>
            )}
            <div className={styles.summaryRowTotal}>
              <span>مبلغ قابل پرداخت</span>
              <span>{formatCurrency(finalAmount)} تومان</span>
            </div>
            {selectedPaymentMethod === 'snapp' && (
              <div className={styles.installmentInfo}>
                <div className={styles.installmentTitle}>پرداخت اقساطی:</div>
                <div className={styles.installmentDetails}>
                  <span>قسط اول: {formatCurrency(firstPayment)} تومان</span>
                  <span>۳ قسط بعدی: هر کدام {formatCurrency(monthlyPayment)} تومان</span>
                  <span>بدون کارمزد و بهره</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button className={styles.backBtn} onClick={onBack}>
              بازگشت
            </button>
            <button className={styles.payBtn} onClick={handlePayment}>
              پرداخت
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartStep3;