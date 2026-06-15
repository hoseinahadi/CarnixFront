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
import styles from './CartPage.module.scss'

const CartPage = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const loading = useAppSelector(selectCartLoading);
  const actionLoading = useAppSelector(selectCartActionLoading);
  const error = useAppSelector(selectCartError);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  console.log('useEffect - dispatching fetchMyCart22222222222222222222222222');

  useEffect(() => {
    console.log('useEffect - dispatching fetchMyCart');
    dispatch(fetchMyCart());
  }, [dispatch]);

  // اگر لودینگ است و سبد خرید هنوز لود نشده
  if (loading && !cart) {
    return <div className={styles.loading}>در حال بارگذاری سبد خرید...</div>;
  }

  // اگر سبد خرید خالی است
  if (!cart || cart.items.length === 0) {
    return <div className={styles.emptyCart}>سبد خرید شما خالی است</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.title}>سبد خرید شما</div>
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
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <CartStep3
            cart={cart}
            onBack={() => setCurrentStep(2)}
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;