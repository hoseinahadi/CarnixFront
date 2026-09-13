'use client';

import React, {
  useEffect,
} from 'react';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import {
  fetchMyCart,
} from '@/store/feature/cart/cartThunks';

import {
  selectCart,
  selectCartLoading,
  selectCartActionLoading,
  selectCartError,
} from '@/store/feature/cart/cartSelectors';

import CartStepper from '@/components/cart/CartStepper';
import CartStep1 from '@/components/cart/CartStep1';
import CartStep2 from '@/components/cart/CartStep2';
import CartStep3 from '@/components/cart/CartStep3';
import { useCheckoutMachine } from '@/features/checkout/hooks/useCheckoutMachine';
import { createQuoteFingerprint } from '@/features/checkout/model/checkoutMachine';

import styles from './CartPage.module.scss';

const CartPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const cart = useAppSelector(selectCart);

  const loading = useAppSelector(
    selectCartLoading,
  );

  const actionLoading = useAppSelector(
    selectCartActionLoading,
  );

  const error = useAppSelector(
    selectCartError,
  );

  /*
   * مهم:
   * تا زمانی که StoreProvider وضعیت Auth را از Storage
   * hydrate نکرده، نباید تصمیم بگیریم کاربر مهمان است یا وارد شده.
   */
  const authInitialized = useAppSelector(
    (state) => state.auth.initialized,
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  const cartId = cart ? Number(cart.cartId) : null;
  const { state: checkout, dispatch: checkoutDispatch } = useCheckoutMachine(
    cartId && Number.isFinite(cartId) ? cartId : null,
  );

  /*
   * Cart را فقط بعد از مشخص‌شدن وضعیت Authentication بگیر.
   *
   * این کار یک Race Condition مهم را هم رفع می‌کند:
   * قبلاً ممکن بود CartPage قبل از Hydrate شدن Token،
   * سبد مهمان را دریافت کند در حالی که کاربر Login بوده است.
   */
  useEffect(() => {
    if (!authInitialized) {
      return;
    }

    void dispatch(
      fetchMyCart({
        force: true,
      }),
    );
  }, [
    dispatch,
    authInitialized,
    isAuthenticated,
  ]);

  /*
   * بعد از Login موفق، callbackUrl کاربر را به:
   *
   * /cart?step=2
   *
   * برمی‌گرداند.
   *
   * فقط اگر واقعاً Login باشد اجازه ورود مستقیم
   * به مرحله آدرس داده می‌شود.
   */
  /*
   * Step 1 -> Step 2
   *
   * کاربر مهمان حق ورود به مراحل:
   * Address / Shipping / Payment
   * را ندارد.
   */
  const handleStep1Next = () => {
    if (!authInitialized) {
      return;
    }

    if (!isAuthenticated) {
      const callbackUrl =
        '/cart?step=2';

      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          callbackUrl,
        )}`,
      );

      return;
    }

    checkoutDispatch({ type: 'GO_TO_DELIVERY' });
  };

  /*
   * Step 2 -> Step 3
   */
  const handleStep2Next = (
    addressId: number,
    shippingMethod: string,
    shippingCost: number,
  ) => {
    if (!cartId) return;
    checkoutDispatch({
      type: 'DELIVERY_CONFIRMED',
      addressId,
      shippingMethod,
      shippingCost,
      quoteFingerprint: createQuoteFingerprint(cartId, addressId, shippingMethod, shippingCost),
    });
  };

  /*
   * لود اولیه Authentication.
   *
   * اجازه نمی‌دهیم قبل از مشخص‌شدن وضعیت Login،
   * صفحه تصمیم اشتباه بگیرد.
   */
  if (!authInitialized) {
    return (
      <div
        className={
          styles.loadingContainer
        }
      >
        <div
          className={styles.spinner}
        />

        <p>
          در حال بررسی اطلاعات کاربری...
        </p>
      </div>
    );
  }

  /*
   * لودینگ اولیه Cart
   */
  if (loading && !cart) {
    return (
      <div
        className={
          styles.loadingContainer
        }
      >
        <div
          className={styles.spinner}
        />

        <p>
          در حال بارگذاری سبد خرید...
        </p>
      </div>
    );
  }

  /*
   * خطای دریافت Cart
   */
  if (error && !cart) {
    return (
      <div
        className={
          styles.errorContainer
        }
      >
        <p>
          ⚠️ خطا در دریافت سبد خرید
        </p>

        <p
          className={
            styles.errorMessage
          }
        >
          {error}
        </p>

        <button
          type="button"
          onClick={() => {
            void dispatch(
              fetchMyCart({
                force: true,
              }),
            );
          }}
          className={styles.retryBtn}
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  /*
   * Cart خالی
   */
  if (
    !cart ||
    !cart.items ||
    cart.items.length === 0
  ) {
    return (
      <div
        className={
          styles.emptyCart
        }
      >
        <div
          className={
            styles.emptyIcon
          }
        >
          🛒
        </div>

        <h3>
          سبد خرید شما خالی است
        </h3>

        <p>
          محصولات مورد علاقه خود را
          پیدا و به سبد خرید اضافه کنید
        </p>

        <Link
          href="/products"
          className={styles.shopBtn}
        >
          مشاهده محصولات
        </Link>
      </div>
    );
  }

  return (
    <div
      className={
        styles.pageContainer
      }
    >
      <h1 className={styles.title}>
        سبد خرید
      </h1>

      <CartStepper
        currentStep={checkout.step}
      />

      <div className={styles.content}>
        {checkout.step === 1 && (
          <CartStep1
            cart={cart}
            actionLoading={
              actionLoading ||
              !authInitialized
            }
            onNext={
              handleStep1Next
            }
          />
        )}

        {checkout.step === 2 && (
          <CartStep2
            cart={cart}
            onNext={
              handleStep2Next
            }
            onBack={() =>
              checkoutDispatch({ type: 'GO_TO_CART' })
            }
          />
        )}

        {checkout.step === 3 && (
          <CartStep3
            cart={cart}
            onBack={() =>
              checkoutDispatch({ type: 'GO_TO_DELIVERY' })
            }
            shippingMethod={
              checkout.shippingMethod
            }
            shippingCost={
              checkout.shippingCost ?? 0
            }
            quoteFingerprint={checkout.quoteFingerprint}
            selectedAddressId={
              checkout.addressId
            }
          />
        )}
      </div>
    </div>
  );
};

export default CartPage;
