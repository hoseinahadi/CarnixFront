// src/app/profile/orders/page.tsx
'use client'

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import styles from './OrdersPage.module.scss';
import { fetchMyOrders } from '@/store/feature/orders/orderThunks';
import { setActiveTab } from '@/store/feature/orders/orderSlice';
import OrderCard from '@/components/profile/OrderCard/OrderCard';
import BackToSidebar from '@/components/profile/BackToSidebar/BackToSidebar';

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, activeTab, loading } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders({ page: 1, pageSize: 10 }));
  }, [dispatch]);

  const tabs = [
    { id: 'all', label: 'تمام سفارشات' },
    { id: 'current', label: 'جاری' },
    { id: 'completed', label: 'تکمیل شده' },
    { id: 'cancelled', label: 'لغو شده' },
  ];

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'current') return [1, 2, 3, 4, 6].includes(o.orderStatusId);
    if (activeTab === 'completed') return [7, 10].includes(o.orderStatusId);
    if (activeTab === 'cancelled') return [8, 9].includes(o.orderStatusId);
    return true;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <BackToSidebar />
         سفارشات
         </h2>

      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? styles.activeTab : ''}
            onClick={() => dispatch(setActiveTab(tab.id as any))}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div className={styles.loader}>در حال بارگذاری...</div> : (
        <div className={styles.orderList}>
          {filteredOrders.map(order => (
            <OrderCard key={order.orderId} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}