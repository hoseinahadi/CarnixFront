'use client';

import React, { useEffect, useState } from 'react';
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

  const [pageSize, setPageSize] = useState<number>(4);

  useEffect(() => {
    const determinePageSize = () => {
      const width = window.innerWidth;

      if (width < 576) return 2;     // موبایل کوچک
      if (width < 768) return 2;     // موبایل
      if (width < 992) return 3;     // تبلت
      if (width < 1200) return 4;    // دسکتاپ
      return 5;                      // دسکتاپ بزرگ
    };

    const size = determinePageSize();
    setPageSize(size);
    dispatch(getBestSellingProducts({ pageNumber: 1, pageSize: size, includeAll: false }));
  }, [dispatch]);

  const products = bestSellersData?.items || [];

  if (loading) {
    return (
      <div className={styles.section}>
        <div className={styles.grid}>
          {Array.from({ length: pageSize }).map((_, index) => (
            <div key={index} className={styles.skeletonCard}></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>پرفروش ترین محصولات</h2>
        <Link href="/products?sortBy=bestSellers" className={styles.link}>
          مشاهده همه
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </Link>
      </div>

      <div className={styles.grid}>
        {products.slice(0, pageSize).map((product) => (
          <ProductCard key={product.productId} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellersSection;