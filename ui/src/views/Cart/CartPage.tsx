'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyCart } from '@/store/feature/cart/cartThunks';
import {
  selectCart,
  selectCartLoading,
  selectCartActionLoading,
  selectCartError
} from '@/store/feature/cart/cartSelectors';

import CartStepper from '@/components/cart/CartStepper';
import CartStep1 from '@/components/cart/CartStep1';
import CartStep2 from '@/components/cart/CartStep2';
import CartStep3 from '@/components/cart/CartStep3';
import styles from './CartPage.module.scss';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const loading = useAppSelector(selectCartLoading);
  const actionLoading = useAppSelector(selectCartActionLoading);
  const error = useAppSelector(selectCartError);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // ⭐ State برای نگهداری اطلاعات انتخاب‌شده در مراحل قبلی
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>('post');
  const [selectedShippingCost, setSelectedShippingCost] = useState<number>(220000);

  useEffect(() => {
    dispatch(fetchMyCart());
  }, [dispatch]);

  // ⭐ هندلر رفتن از Step2 به Step3 با ذخیره اطلاعات
  const handleStep2Next = (addressId: number, shippingMethod: string, shippingCost: number) => {
    setSelectedAddressId(addressId);
    setSelectedShippingMethod(shippingMethod);
    setSelectedShippingCost(shippingCost);
    setCurrentStep(3);
  };

  // لودینگ اولیه
  if (loading && !cart) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال بارگذاری سبد خرید...</p>
      </div>
    );
  }

  // خطا در دریافت سبد خرید
  if (error && !cart) {
    return (
      <div className={styles.errorContainer}>
        <p>⚠️ خطا در دریافت سبد خرید</p>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={() => dispatch(fetchMyCart())} className={styles.retryBtn}>
          تلاش مجدد
        </button>
      </div>
    );
  }

  // سبد خرید خالی
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className={styles.emptyIcon}>🛒</div>
        <h3>سبد خرید شما خالی است</h3>
        <p>محصولات مورد علاقه خود را پیدا و به سبد خرید اضافه کنید</p>
        <a href="/products" className={styles.shopBtn}>
          مشاهده محصولات
        </a>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>سبد خرید</h1>
      
      <CartStepper currentStep={currentStep} />

      <div className={styles.content}>
        {currentStep === 1 && (
          <CartStep1
            cart={cart}
            actionLoading={actionLoading}
            onNext={() => setCurrentStep(2)}
          />
        )}
        {currentStep === 2 && (
          <CartStep2
            cart={cart}
            onNext={handleStep2Next}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <CartStep3
            cart={cart}
            onBack={() => setCurrentStep(2)}
            shippingMethod={selectedShippingMethod}
            shippingCost={selectedShippingCost}
            selectedAddressId={selectedAddressId}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;