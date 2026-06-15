'use client'

import React, { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchOrderDetail } from '@/store/feature/orders/orderThunks'
import { 
  selectSelectedOrder, 
  selectOrderDetailLoading,
  selectOrderError 
} from '@/store/feature/orders/orderSelectors'
import { clearSelectedOrder } from '@/store/feature/orders/orderSlice'
import styles from './OrderDetail.module.scss'
import { IconArrowRight, IconTruck, IconPackage, IconReceipt } from '@tabler/icons-react'

export default function OrderDetailPage() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const order = useAppSelector(selectSelectedOrder)
  const loading = useAppSelector(selectOrderDetailLoading)
  const error = useAppSelector(selectOrderError)

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(Number(id)))
    }
    
    // پاکسازی هنگام خروج از صفحه
    return () => {
      dispatch(clearSelectedOrder())
    }
  }, [id, dispatch])

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>در حال دریافت اطلاعات سفارش...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.notFound}>
        <p>{error}</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          بازگشت
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <p>سفارش یافت نشد.</p>
        <button onClick={() => router.back()} className={styles.backButton}>
          بازگشت
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <IconArrowRight size={20} />
        بازگشت به سفارش‌ها
      </button>

      <div className={styles.card}>
        <h2 className={styles.title}>جزئیات سفارش #{order.orderNumber}</h2>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <IconReceipt size={20} />
            <div>
              <span className={styles.label}>وضعیت</span>
              <span>{order.orderStatus}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <IconTruck size={20} />
            <div>
              <span className={styles.label}>تاریخ ثبت</span>
              <span>{new Date(order.orderDate).toLocaleDateString('fa-IR')}</span>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <h3 className={styles.subTitle}>اقلام سفارش</h3>
        <div className={styles.itemsList}>
          {order.items?.map((item: any, index: number) => (
            <div key={index} className={styles.itemRow}>
              <IconPackage size={18} />
              <span className={styles.itemName}>{item.productName}</span>
              <span className={styles.itemQuantity}>×{item.quantity}</span>
              <span className={styles.itemPrice}>
                {new Intl.NumberFormat('fa-IR').format(item.unitPrice)} تومان
              </span>
            </div>
          ))}
        </div>

        <div className={styles.divider}></div>

        <div className={styles.totalRow}>
          <span>مبلغ کل:</span>
          <span className={styles.totalPrice}>
            {new Intl.NumberFormat('fa-IR').format(order.grandTotal || 0)} تومان
          </span>
        </div>
      </div>
    </div>
  )
}