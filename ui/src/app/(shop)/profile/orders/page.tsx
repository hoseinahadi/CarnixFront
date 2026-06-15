'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchMyOrders } from '@/store/feature/orders/orderThunks'
import { 
  selectOrders, 
  selectOrdersLoading, 
  selectOrdersPagination 
} from '@/store/feature/orders/orderSelectors'
import styles from './OrdersPage.module.scss'
import { IconShoppingBag, IconChevronLeft, IconTruck } from '@tabler/icons-react'

export default function OrdersPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const orders = useAppSelector(selectOrders)
  const loading = useAppSelector(selectOrdersLoading)
  const pagination = useAppSelector(selectOrdersPagination)

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, pageSize: 10 }))
  }, [dispatch])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      Pending: { label: 'در انتظار پردازش', className: styles.pending },
      Processing: { label: 'در حال پردازش', className: styles.processing },
      Shipped: { label: 'ارسال شده', className: styles.shipped },
      Delivered: { label: 'تحویل داده شده', className: styles.delivered },
      Cancelled: { label: 'لغو شده', className: styles.cancelled },
    }
    const statusInfo = statusMap[status] || { label: status, className: '' }
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('fa-IR').format(price)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>در حال دریافت سفارش‌ها...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className={styles.emptyState}>
        <IconShoppingBag size={64} stroke={1} className={styles.emptyIcon} />
        <h3>سفارشی یافت نشد</h3>
        <p>شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
        <button onClick={() => router.push('/')} className={styles.shopButton}>
          رفتن به فروشگاه
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>سفارش‌های من</h2>

      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.orderId} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.orderInfo}>
                <span className={styles.orderNumber}>
                  شماره سفارش: {order.orderNumber}
                </span>
                <span className={styles.orderDate}>
                  {new Date(order.orderDate).toLocaleDateString('fa-IR')}
                </span>
              </div>
              {getStatusBadge(order.orderStatus)}
            </div>

            <div className={styles.orderBody}>
              <div className={styles.orderMeta}>
                <div className={styles.metaItem}>
                  <IconTruck size={18} stroke={1.5} />
                  <span>مبلغ: {formatPrice(order.grandTotal || 0)} تومان</span>
                </div>
              </div>
            </div>

            <div className={styles.orderFooter}>
              <button
                className={styles.detailButton}
                onClick={() => router.push(`/profile/orders/${order.orderId}`)}
              >
                مشاهده جزئیات
                <IconChevronLeft size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${page === pagination.currentPage ? styles.activePage : ''}`}
              onClick={() => dispatch(fetchMyOrders({ page, pageSize: pagination.pageSize }))}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}