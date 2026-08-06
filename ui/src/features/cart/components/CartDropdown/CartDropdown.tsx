'use client'

import React from 'react'
import { CircularProgress } from '@mui/material'
import { IconX, IconMinus, IconPlus, IconTrash } from '@tabler/icons-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks'
import { selectCartActionLoading } from '@/store/feature/cart/cartSelectors'
import styles from './CartDropdown.module.scss'
import { Cart } from '@/models/cart/Cart'

interface CartDropdownProps {
  cart: Cart | null
  loading: boolean
  onClose: () => void
}

const FREE_SHIPPING_THRESHOLD = 5000000;

const CartDropdown = ({ cart, loading, onClose }: CartDropdownProps) => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  const actionLoading = useAppSelector(selectCartActionLoading)

  const formatPrice = (price: number) => new Intl.NumberFormat('fa-IR').format(price)

  const handleNavigate = (path: string) => {
    onClose()
    router.push(path)
  }

  const handleQuantityChange = (cartItemId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change
    if (newQuantity < 1) return
    dispatch(updateItemQuantity({ cartItemId, quantity: newQuantity }))
  }

  const handleDecreaseOrRemove = (cartItemId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      dispatch(updateItemQuantity({ cartItemId, quantity: currentQuantity - 1 }))
    } else {
      dispatch(removeCartItem(cartItemId))
    }
  }

  const currentTotal = cart?.grandTotal || 0;
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - currentTotal, 0);
  const progressPercentage = Math.min((currentTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className={styles.cartDropdownContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          سبد خرید شما ({cart?.totalItemsCount || 0})
        </div>
        <button onClick={onClose} className={styles.closeBtn}>
          <IconX size={20} stroke={1.5} />
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress size={30} />
        </div>
      ) : !cart || cart.items?.length === 0 ? (
        <div className={styles.emptyCart}>
          سبد خرید شما در حال حاضر خالی است.
        </div>
      ) : (
        <>
          <div className={styles.itemsList}>
            {cart.items.map((item, index) => (
              <div key={`cart-item-${item.cartItemId}-${index}`} className={styles.cartItem}>
                <div className={styles.imageContainer}>
                  {item.product?.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.productName}
                      width={60}
                      height={60}
                    />
                  ) : (
                    <div className={styles.noImage}>بدون عکس</div>
                  )}
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.productName}>
                    {item.product?.productName || 'محصول نامشخص'}
                  </div>
                  <div className={styles.priceWrapper}>
                    <span className={styles.price}>{formatPrice(item.unitPrice)}</span>
                    <span className={styles.currency}>تومان</span>
                  </div>
                </div>

                <div className={styles.quantityControls}>
                  <div className={styles.quantityBox}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(item.cartItemId, item.quantity, 1)}
                      disabled={actionLoading}
                    >
                      <IconPlus size={14} />
                    </button>
                    
                    <span className={styles.quantityValue}>
                      {actionLoading ? (
                        <CircularProgress size={12} />
                      ) : (
                        // 🟢 باگ تبدیل واحد پولی برای تعداد محصول اصلاح شد
                        new Intl.NumberFormat('fa-IR').format(item.quantity)
                      )}
                    </span>
                    
                    <button 
                      className={`${styles.quantityBtn} ${item.quantity === 1 ? styles.danger : ''}`}
                      onClick={() => handleDecreaseOrRemove(item.cartItemId, item.quantity)}
                      disabled={actionLoading}
                    >
                      {item.quantity > 1 ? <IconMinus size={14} /> : <IconTrash size={14} />}
                    </button>
                  </div>
                  
                  <div className={styles.itemTotalPrice}>
                    {formatPrice(item.totalPrice)} تومان
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.freeShippingContainer}>
              {remainingForFreeShipping > 0 ? (
                <div className={styles.shippingText}>
                  با افزودن <strong>{formatPrice(remainingForFreeShipping)}</strong> تومان دیگر سفارش شما رایگان ارسال خواهد شد
                </div>
              ) : (
                <div className={`${styles.shippingText} ${styles.freeShipping}`}>
                  سفارش شما شامل <strong>ارسال رایگان</strong> است!
                </div>
              )}
              <div className={styles.progressBarWrapper}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className={styles.grandTotal}>
              <span>جمع کل سبد خرید:</span>
              <strong>{formatPrice(cart.grandTotal)} تومان</strong>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.continueBtn} onClick={onClose}>
                ادامه خرید
              </button>
              <button className={styles.viewCartBtn} onClick={() => handleNavigate('/cart')}>
                مشاهده سبد خرید
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CartDropdown