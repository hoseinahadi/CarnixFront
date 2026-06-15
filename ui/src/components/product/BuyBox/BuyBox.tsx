'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks'; 
import { selectProductDetails, selectDetailsLoading } from '@/store/feature/product/productSelectors'; 
import { addToCart, updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks'; 
import { selectCart, selectCartActionLoading } from '@/store/feature/cart/cartSelectors'; 
import { Plus, Minus, Trash2, Store, ShieldCheck, CheckCircle2, Loader2, Info } from 'lucide-react';
import styles from './BuyBox.module.scss';

export default function BuyBox() {
  const dispatch = useAppDispatch();
  
  // خواندن اطلاعات محصول و سبد خرید از استور
  const product = useAppSelector(selectProductDetails);
  const isLoading = useAppSelector(selectDetailsLoading);
  const cart = useAppSelector(selectCart);
  const actionLoading = useAppSelector(selectCartActionLoading);

  // حالت لودینگ اولیه (اسکلتون)
  if (isLoading || !product) {
    return <div className={styles.skeletonBuyBox}></div>;
  }

  // بررسی وضعیت محصول در سبد خرید
  const cartItem = cart?.items?.find((item: any) => item.productId === product.productId);
  const isInCart = !!cartItem;

  const hasDiscount = product.productDiscount && product.productDiscount.isActive;
  const finalPrice = product.basePrice; // در صورت وجود منطق تخفیف اینجا اعمال شود

  // --- هندلرهای سبد خرید ---
  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.productId, quantity: 1 }));
  };

  const handleIncrease = () => {
    if (cartItem) {
      dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecreaseOrRemove = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity - 1 }));
      } else {
        dispatch(removeCartItem(cartItem.cartItemId));
      }
    }
  };

  return (
    <div className={styles.buyBoxContainer}>
      
      {/* ======================================= */}
      {/* بخش اطلاعات فروشنده (فقط در دسکتاپ نمایش داده می‌شود) */}
      {/* ======================================= */}
      <div className={styles.desktopInfo}>
        <h3 className={styles.sellerTitle}>فروشنده</h3>
        
        <div className={styles.infoRow}>
          <Store size={20} className={styles.icon} />
          <span>ایساکو</span>
        </div>
        
        <hr className={styles.divider} />
        
        <div className={styles.infoRow}>
          <ShieldCheck size={20} className={styles.icon} />
          <span>گارانتی اصالت و سلامت فیزیکی کالا</span>
        </div>
        
        <hr className={styles.divider} />
        
        <div className={styles.infoRow}>
          <CheckCircle2 size={20} className={styles.iconSuccess} />
          <span className={styles.stockText}>موجود در انبار</span>
        </div>
        
        <hr className={styles.divider} />

        <div className={styles.infoRow}>
          <Info size={20} className={styles.iconInfo} />
          <span className={styles.mutedText}>ارسال سریع به سراسر کشور</span>
        </div>
      </div>

      {/* ======================================= */}
      {/* بخش اکشن‌ها: قیمت و دکمه خرید (موبایل و دسکتاپ) */}
      {/* ======================================= */}
      <div className={styles.actionSection}>
        
        {/* قیمت (مشابه عکس موبایل شما) */}
        <div className={styles.priceContainer}>
          {hasDiscount && (
            <div className={styles.oldPriceWrapper}>
              <span className={styles.oldPrice}>{product.basePrice.toLocaleString('fa-IR')}</span>
              <span className={styles.discountBadge}>٪{product.productDiscount.percent}</span>
            </div>
          )}
          <div className={styles.finalPrice}>
            {finalPrice.toLocaleString('fa-IR')} <span className={styles.currency}>تومان</span>
          </div>
        </div>

        {/* دکمه‌های مدیریت سبد خرید */}
        <div className={styles.buttonContainer}>
          {!isInCart ? (
            <button 
              className={styles.addToCartBtn} 
              onClick={handleAddToCart}
              disabled={actionLoading || product.totalStock <= 0}
            >
              {actionLoading ? <Loader2 className={styles.spinner} size={24} /> : 'افزودن به سبد خرید'}
            </button>
          ) : (
            <div className={styles.cartControls}>
              <button 
                onClick={handleIncrease} 
                disabled={actionLoading} 
                className={styles.controlBtn}
              >
                <Plus size={20} />
              </button>
              
              <span className={styles.quantityNumber}>
                {actionLoading ? <Loader2 className={styles.spinner} size={18} /> : cartItem.quantity.toLocaleString('fa-IR')}
              </span>

              <button 
                onClick={handleDecreaseOrRemove} 
                disabled={actionLoading} 
                className={`${styles.controlBtn} ${cartItem.quantity === 1 ? styles.danger : ''}`}
              >
                {cartItem.quantity > 1 ? <Minus size={20} /> : <Trash2 size={20} />}
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
