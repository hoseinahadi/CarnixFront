'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectBestSellers, selectBestSellersLoading } from '@/store/feature/product/productSelectors';
import { getBestSellingProducts } from '@/store/feature/product/productThunks';
import ProductCard from '@/components/product/productCard/ProductCard';
import styles from './BestSellersSection.module.scss';

const BestSellersSection = () => {
  const dispatch = useAppDispatch();
  const bestSellersData = useAppSelector(selectBestSellers);
  const loading = useAppSelector(selectBestSellersLoading);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const determinePageSize = () => {
      const width = window.innerWidth;
      if (width < 576) return 4;
      if (width < 768) return 5;
      if (width < 992) return 6;
      return 8;
    };

    const size = determinePageSize();
    dispatch(getBestSellingProducts({ pageNumber: 1, pageSize: size, includeAll: true }));
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
  }, []);

  const rawData = bestSellersData?.mainResults || bestSellersData?.data || bestSellersData;
  const products = Array.isArray(rawData) ? rawData : (rawData?.items || []);

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>پرفروش‌ترین محصولات</h2>
        </div>
        <div className={styles.scrollContainer}>
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
        <h2 className={styles.title}>پرفروش‌ترین محصولات</h2>
        {/* 🟢 اضافه شدن SVG برای جلوگیری از به هم ریختگی کاراکترها */}
        <Link href="/products?sortBy=bestsellers" className={styles.viewAll}>
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

export default BestSellersSection;