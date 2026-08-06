'use client';

import { useMemo } from 'react';
import {
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addToCart,
  removeCartItem,
  updateItemQuantity,
} from '@/store/feature/cart/cartThunks';
import {
  selectCart,
  selectCartActionLoading,
} from '@/store/feature/cart/cartSelectors';
import {
  selectEffectivePrice,
  selectEffectivePriceLoading,
} from '@/store/feature/product/productDetailSelectors';
import {
  selectDetailsLoading,
  selectProductDetails,
} from '@/store/feature/product/productSelectors';

import styles from './BuyBox.module.scss';

export default function BuyBox() {
  const dispatch = useAppDispatch();
  const product = useAppSelector(
    selectProductDetails,
  );
  const isProductLoading = useAppSelector(
    selectDetailsLoading,
  );
  const effectivePrice = useAppSelector(
    selectEffectivePrice,
  );
  const effectivePriceLoading = useAppSelector(
    selectEffectivePriceLoading,
  );
  const cart = useAppSelector(selectCart);
  const actionLoading = useAppSelector(
    selectCartActionLoading,
  );

  const priceToDisplay = useMemo(() => {
    if (!product) {
      return 0;
    }

    if (
      effectivePrice !== null &&
      effectivePrice !== undefined
    ) {
      return effectivePrice;
    }

    if (
      typeof product.basePrice === 'number'
    ) {
      return product.basePrice;
    }

    return product.skus?.[0]?.price || 0;
  }, [effectivePrice, product]);

  if (isProductLoading || !product) {
    return (
      <div className={styles.buyBoxContainer}>
        <div
          className={styles.skeletonBuyBox}
        />
      </div>
    );
  }

  const cartItem = cart?.items?.find(
    (item: {
      productId: number;
    }) =>
      item.productId === product.productId,
  );
  const isInCart = Boolean(cartItem);
  const isAvailable =
    product.totalStock > 0 &&
    product.isActive;

  const handleAddToCart = () => {
    if (!isAvailable) {
      return;
    }

    void dispatch(
      addToCart({
        productId: product.productId,
        quantity: 1,
      }),
    );
  };

  const handleIncrease = () => {
    if (
      cartItem &&
      cartItem.quantity < product.totalStock
    ) {
      void dispatch(
        updateItemQuantity({
          cartItemId: cartItem.cartItemId,
          quantity: cartItem.quantity + 1,
        }),
      );
    }
  };

  const handleDecreaseOrRemove = () => {
    if (!cartItem) {
      return;
    }

    if (cartItem.quantity > 1) {
      void dispatch(
        updateItemQuantity({
          cartItemId: cartItem.cartItemId,
          quantity: cartItem.quantity - 1,
        }),
      );
      return;
    }

    void dispatch(
      removeCartItem(cartItem.cartItemId),
    );
  };

  return (
    <div className={styles.buyBoxContainer}>
      <div className={styles.featuresList}>
        <div className={styles.featureItem}>
          <ShieldCheck
            size={20}
            strokeWidth={1.5}
            className={styles.icon}
          />
          <span>گارانتی اصالت کالا</span>
        </div>

        <div className={styles.featureItem}>
          <Truck
            size={20}
            strokeWidth={1.5}
            className={styles.icon}
          />
          <span>ارسال به سراسر ایران</span>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.snappPaySection}>
        <span
          className={styles.snappPayText}
        >
          پرداخت اقساط با اسنپ
        </span>
        <div className={styles.snappPayLogo}>
          <span className={styles.snapp}>
            Snapp!
          </span>
          <span className={styles.pay}>
            Pay
          </span>
        </div>
      </div>

      <hr className={styles.divider} />

      <div className={styles.actionSection}>
        <div className={styles.priceContainer}>
          <div className={styles.finalPrice}>
            {effectivePriceLoading &&
            priceToDisplay === 0 ? (
              <Loader2
                className={styles.spinner}
                size={20}
              />
            ) : (
              <>
                {priceToDisplay.toLocaleString(
                  'fa-IR',
                )}
                <span
                  className={styles.currency}
                >
                  تومان
                </span>
              </>
            )}
          </div>
        </div>

        <div className={styles.buttonContainer}>
          {!cartItem ? (
            <button
              type="button"
              className={styles.addToCartBtn}
              onClick={handleAddToCart}
              disabled={
                actionLoading || !isAvailable
              }
            >
              {actionLoading ? (
                <Loader2
                  className={styles.spinner}
                  size={24}
                />
              ) : isAvailable ? (
                'افزودن به سبد خرید'
              ) : (
                'ناموجود'
              )}
            </button>
          ) : (
            <div className={styles.cartControls}>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={
                  actionLoading ||
                  cartItem.quantity >=
                    product.totalStock
                }
                className={styles.controlBtn}
              >
                <Plus size={20} />
              </button>

              <span
                className={styles.quantityNumber}
              >
                {actionLoading ? (
                  <Loader2
                    className={styles.spinner}
                    size={18}
                  />
                ) : (
                  cartItem.quantity.toLocaleString(
                    'fa-IR',
                  )
                )}
              </span>

              <button
                type="button"
                onClick={handleDecreaseOrRemove}
                disabled={actionLoading}
                className={`${
                  styles.controlBtn
                } ${
                  cartItem.quantity === 1
                    ? styles.danger
                    : ''
                }`}
              >
                {cartItem.quantity > 1 ? (
                  <Minus size={20} />
                ) : (
                  <Trash2 size={20} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
