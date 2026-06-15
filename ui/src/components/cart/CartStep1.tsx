'use client';

import React from 'react';
import { useAppDispatch } from '@/store/hooks';
import { 
  updateItemQuantity, 
  removeCartItem 
} from '@/store/feature/cart/cartThunks';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag 
} from 'lucide-react';
import styles from './CartStep1.module.scss';

interface CartStep1Props {
  cart: any;
  actionLoading: boolean;
  onNext: () => void;
}

// تابع کمکی برای تبدیل عدد به رشتهٔ فارسی با جداکنندهٔ هزارگان
const toPersianNumber = (value: number | undefined | null): string => {
  if (value == null || isNaN(value)) return '۰';
  const formatted = value.toLocaleString('fa-IR'); // ارقام فارسی + کاما
  return formatted;
};

const CartStep1: React.FC<CartStep1Props> = ({ cart, actionLoading, onNext }) => {
  const dispatch = useAppDispatch();

  const handleQuantityChange = (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateItemQuantity({ cartItemId, quantity: newQuantity }));
  };

  const handleRemove = (cartItemId: number) => {
    dispatch(removeCartItem(cartItemId));
  };

  return (
    <>
      <div className={styles.sectionHeader}>
        <h3>محصولات انتخابی</h3>
      </div>
    
      <div className={styles.step1Container}>
        {/* سمت راست: لیست محصولات */}
        <div className={styles.cartItems}>
          {cart.items.map((item: any) => (
            <div key={item.cartItemId} className={styles.cartItem}>
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
                    onClick={() => handleRemove(item.cartItemId)}
                    disabled={actionLoading}
                    className={styles.deleteBtn}
                    aria-label="حذف محصول"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {toPersianNumber(item.price || item.unitPrice)} تومان
                    </span>
                  </div>
                  <div className={styles.quantityControl}>
                    <button 
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                      disabled={item.quantity <= 1 || actionLoading}
                      className={styles.qtyBtn}
                      aria-label="کاهش تعداد"
                    >
                      <Minus size={16} />
                    </button>
                    <span className={styles.qtyValue}>
                      {toPersianNumber(item.quantity)}
                    </span>
                    <button 
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                      disabled={actionLoading}
                      className={styles.qtyBtn}
                      aria-label="افزایش تعداد"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* سمت چپ: خلاصه سفارش */}
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
              <span>{toPersianNumber(cart.grandTotal || cart.totalAmount)} تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>سود شما از خرید</span>
              <span className={styles.discountAmount}>۶۳۵,۰۰۰ تومان</span>
            </div>
            <div className={styles.summaryRow}>
              <span>هزینه ارسال</span>
              <span className={styles.shippingInfo}>
                {toPersianNumber(0)} تومان
                <span className={styles.infoIcon}>ⓘ</span>
              </span>
            </div>
            <div className={styles.summaryRowTotal}>
              <span>جمع مبلغ قابل پرداخت</span>
              <span>{toPersianNumber(cart.grandTotal || cart.totalAmount)} تومان</span>
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