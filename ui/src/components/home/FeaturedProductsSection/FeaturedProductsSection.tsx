'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const pageSize = 10;

  // 🟢 اضافه‌شدن قابلیت Drag
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    if (activeTab === 'featured') {
      dispatch(getFeaturedProductsPaged({ pageNumber: 1, pageSize }));
    } else {
      dispatch(getDiscountedProductsPaged({ pageNumber: 1, pageSize }));
    }
  }, [dispatch, activeTab]);

  const isLoading = activeTab === 'featured' ? isFeaturedLoading : isDiscountedLoading;

  useEffect(() => {
    const slider = scrollContainerRef.current;
    if (!slider) return;

    const onMouseDown = (e: MouseEvent) => {
      isDown.current = true;
      slider.classList.add(styles.active);
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };

    const onMouseLeave = () => {
      isDown.current = false;
      slider.classList.remove(styles.active);
    };

    const onMouseUp = () => {
      isDown.current = false;
      slider.classList.remove(styles.active);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener('mousedown', onMouseDown);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('mouseup', onMouseUp);
    slider.addEventListener('mousemove', onMouseMove);

    return () => {
      slider.removeEventListener('mousedown', onMouseDown);
      slider.removeEventListener('mouseleave', onMouseLeave);
      slider.removeEventListener('mouseup', onMouseUp);
      slider.removeEventListener('mousemove', onMouseMove);
    };
  }, [isLoading, activeTab]); // 🟢 اجرای مجدد بایندینگ‌ها بعد از لود هر تب

  const currentData = activeTab === 'featured' ? featuredData : discountedData;
  const rawData = currentData?.mainResults || currentData?.data || currentData;
  const products = Array.isArray(rawData) ? rawData : (rawData?.items || []);

  const getViewAllLink = () => {
    return activeTab === 'featured' ? '/products?sortBy=featured' : '/products?sortBy=discounted';
  };

  const tabs = [
    { id: 'featured', label: 'محصولات ویژه' },
    { id: 'discounted', label: 'تخفیف‌دار' },
  ];

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h2 className={styles.title}>محصولات ویژه</h2>
            <Link href={getViewAllLink()} className={styles.viewAllLink}>
              مشاهده همه
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </Link>
          </div>

          <div className={styles.tabsWrapper}>
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
        </div>

        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard}></div>
            ))
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              <p>محصولی یافت نشد</p>
            </div>
          ) : (
            products.map((product: any) => (
              <div key={product.productId} className={styles.cardWrapper}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;