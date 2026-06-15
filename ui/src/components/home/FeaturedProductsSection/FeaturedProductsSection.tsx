'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectFeaturedProducts, selectFeaturedLoading,
  selectDiscountedProducts, selectDiscountedLoading
} from '@/store/feature/product/productSelectors';
import {
  getFeaturedProductsPaged,
  getDiscountedProductsPaged
} from '@/store/feature/product/productThunks';
import ProductCard from '@/components/product/productCard/ProductCard';
import styles from './FeaturedProductsSection.module.scss';

const FeaturedProductsSection = () => {
  const dispatch = useAppDispatch();

  const featuredData = useAppSelector(selectFeaturedProducts);
  const isFeaturedLoading = useAppSelector(selectFeaturedLoading);
  const discountedData = useAppSelector(selectDiscountedProducts);
  const isDiscountedLoading = useAppSelector(selectDiscountedLoading);

  const [activeTab, setActiveTab] = useState<'featured' | 'discounted'>('featured');
  const [pageSize, setPageSize] = useState<number>(8);

  useEffect(() => {
    const determinePageSize = () => {
      const width = window.innerWidth;
      if (width < 576) return 2;
      if (width < 992) return 4;
      if (width < 1200) return 6;
      return 8;
    };
    setPageSize(determinePageSize());
  }, []);

  useEffect(() => {
    if (activeTab === 'featured') {
      dispatch(getFeaturedProductsPaged({ pageNumber: 1, pageSize }));
    } else {
      dispatch(getDiscountedProductsPaged({ pageNumber: 1, pageSize }));
    }
  }, [dispatch, activeTab, pageSize]);

  const currentData = activeTab === 'featured' ? featuredData : discountedData;
  const isLoading = activeTab === 'featured' ? isFeaturedLoading : isDiscountedLoading;
  const products = currentData?.items || [];

  // 🆕 ساخت لینک مشاهده همه بر اساس تب فعال
  const getViewAllLink = () => {
    if (activeTab === 'featured') {
      return '/products?sortBy=featured';
    } else {
      return '/products?sortBy=discounted';
    }
  };

  const tabs = [
    { id: 'featured', label: 'محصولات ویژه' },
    { id: 'discounted', label: 'تخفیف‌دار' },
  ];

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleAndTabs}>
            <h2 className={styles.title}>محصولات ویژه</h2>
            <div className={styles.tabs}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id as 'featured' | 'discounted')}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <Link href={getViewAllLink()} className={styles.viewAllLink}>
            مشاهده همه
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Link>
        </div>

        <div className={styles.grid}>
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}></div>
            ))
          ) : (
            products.slice(0, pageSize).map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;