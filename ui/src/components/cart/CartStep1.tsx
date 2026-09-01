'use client';

import React from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks';
import { Trash2, Minus, Plus } from 'lucide-react';
import styles from './CartStep1.module.scss';
import { calculateRoundedCartSubtotal, calculateTaxFreeCartTotal, formatPrice } from '@/utils/price';
import toast from 'react-hot-toast'; // 🟢

interface CartStep1Props {
  cart: any;
  actionLoading: boolean;
  onNext: () => void;
}

const toPersianNumber = (value: number | undefined | null): string => {
  if (value == null || isNaN(value)) return '۰';
  return value.toLocaleString('fa-IR');
};

const CartStep1: React.FC<CartStep1Props> = ({ cart, actionLoading, onNext }) => {
  const dispatch = useAppDispatch();

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await dispatch(updateItemQuantity({ cartItemId, quantity: newQuantity })).unwrap();
    } catch (error) {
      toast.error(error as string, { duration: 4000 }); // 🟢
    }
  };

  const handleRemove = async (cartItemId: number) => {
    try {
      await dispatch(removeCartItem(cartItemId)).unwrap();
      toast.success('حذف شد', { duration: 3000 }); // 🟢
    } catch (error) {
      toast.error(error as string, { duration: 4000 }); // 🟢
    }
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>محصولات انتخابی</h3>
      </div>
    
      <div className={styles.step1Container}>
        <div className={styles.cartItems}>
          {cart.items.map((item: any) => {
            const currentItemId = item.cartItemId || item.id || item.productId;

            return (
              <div key={currentItemId} className={styles.cartItem}>
                <div className={styles.image}>
                  <img 
                    src={item.imageUrl || item.product?.imageUrl} 
                    alt={item.productName || item.product?.productName} 
                  />
                </div>
                <div className={styles.itemContent}>
                  <div className={styles.details}>
                    <h3 className={styles.productName}>
                      {item.productName || item.product?.productName}
                    </h3>
                    <div className={styles.productCode}>
                      کد قطعه: {item.product?.sku || '---'}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button 
                      onClick={() => handleRemove(currentItemId)}
                      disabled={actionLoading}
                      className={styles.deleteBtn}
                      aria-label="حذف محصول"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        {formatPrice(item.price || item.unitPrice)} تومان
                      </span>
                    </div>
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => handleQuantityChange(currentItemId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || actionLoading}
                        className={styles.qtyBtn}
                      >
                        <Minus size={16} />
                      </button>
                      <span className={styles.qtyValue}>
                        {toPersianNumber(item.quantity)}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(currentItemId, item.quantity + 1)}
                        disabled={actionLoading}
                        className={styles.qtyBtn}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryHeader}>
            <h3>خلاصه سفارش</h3>
          </div>

          <div className={styles.summaryContent}>
            <div className={styles.summaryRow}>
              <span>تعداد کالا</span>
              <span>{toPersianNumber(cart.totalItemsCount)} عدد</span>
            </div>
            <div className={styles.summaryRow}>
              <span>قیمت کالاها</span>
              <span>{formatPrice(calculateRoundedCartSubtotal(cart))} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>سود شما از خرید</span>
              <span className={styles.discountAmount}>
                {formatPrice(cart.totalDiscount || 0)} تومان
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span className={styles.shippingInfo}>
                وابسته به آدرس
                <span className={styles.infoIcon}>ⓘ</span>
              </span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>جمع مبلغ قابل پرداخت</span>
              <span>{formatPrice(calculateTaxFreeCartTotal(cart))} تومان</span>
            </div>
          </div>

          <button 
            className={styles.nextBtn}
            onClick={onNext}
            disabled={actionLoading || !cart.items.length}
          >
            ادامه
          </button>
        </div>
      </div>
    </>
  );
};

export default CartStep1;