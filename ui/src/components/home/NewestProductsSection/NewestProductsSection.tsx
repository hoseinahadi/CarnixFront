'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNewestProducts, selectNewestLoading } from '@/store/feature/product/productSelectors';
import { getNewestProductsPaged } from '@/store/feature/product/productThunks';
import ProductCard from '@/components/product/productCard/ProductCard';
import styles from './NewestProductsSection.module.scss';

const NewestProductsSection = () => {
  const dispatch = useAppDispatch();
  const newestProductsData = useAppSelector(selectNewestProducts);
  const loading = useAppSelector(selectNewestLoading);
  
  // 🟢 اضافه‌شدن قابلیت Drag
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    // برای اسلایدر نیازی به واکنشگرایی تعداد در ریکوئست نیست، 10 تا می‌گیریم تا کاربر اسکرول کند
    dispatch(getNewestProductsPaged({ pageNumber: 1, pageSize: 10 }));
  }, [dispatch]);

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
  }, [loading]); // 🟢 وابستگی به loading تا وقتی محصولات لود شدند ایونت‌ها بایند شوند

  const rawData = newestProductsData?.mainResults || newestProductsData?.data || newestProductsData;
  const products = Array.isArray(rawData) ? rawData : (rawData?.items || []);

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>جدیدترین محصولات</h2>
        </div>
        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>جدیدترین محصولات</h2>
        <Link href="/products?sortBy=newest" className={styles.link}>
          مشاهده همه
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        {products.map((product: any) => (
          <div key={product.productId} className={styles.cardWrapper}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewestProductsSection;