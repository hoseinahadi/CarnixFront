'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import ProductCard from '@/components/product/productCard/ProductCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

import {
  selectNewestLoading,
  selectNewestProducts,
  selectNewestStatus,
} from '@/store/feature/product/productSelectors';

import {
  getNewestProductsPaged,
} from '@/store/feature/product/productThunks';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import styles from './NewestProductsSection.module.scss';

const NewestProductsSection = () => {
  const dispatch =
    useAppDispatch();

  const newestProducts =
    useAppSelector(
      selectNewestProducts,
    );

  const loading =
    useAppSelector(
      selectNewestLoading,
    );

  const status =
    useAppSelector(
      selectNewestStatus,
    );

  const scrollContainerRef =
    useHorizontalDragScroll<HTMLDivElement>(
      styles.active,
    );

  // ============================================================
  // LOAD NEWEST PRODUCTS
  // ============================================================

  useEffect(() => {
    /*
     * فقط در حالت idle درخواست می‌زنیم.
     *
     * IMPORTANT:
     *
     * اینجا نباید request.abort() در cleanup داشته باشیم.
     *
     * چون بعد از dispatch:
     *
     * idle
     * ↓
     * pending
     * ↓
     * status = loading
     * ↓
     * effect دوباره اجرا می‌شود
     *
     * و cleanup قبلی اگر abort داشته باشد
     * همان Request را لغو می‌کند.
     */
    if (status !== 'idle') {
      return;
    }

    void dispatch(
      getNewestProductsPaged({
        pageNumber: 1,
        pageSize: 10,
      }),
    );
  }, [
    dispatch,
    status,
  ]);

  // ============================================================
  // PRODUCTS
  // ============================================================

  const products =
    newestProducts?.items ??
    [];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        className={
          styles.section
        }
      >
        <div
          className={
            styles.header
          }
        >
          <h2
            className={
              styles.title
            }
          >
            جدیدترین محصولات
          </h2>
        </div>

        <div
          className={
            styles.scrollContainer
          }
        >
          {Array.from({
            length: 4,
          }).map(
            (
              _,
              index,
            ) => (
              <div
                key={index}
                className={
                  styles.skeletonCard
                }
              />
            ),
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (
    products.length === 0
  ) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.header
        }
      >
        <h2
          className={
            styles.title
          }
        >
          جدیدترین محصولات
        </h2>

        <Link
          href="/products?sortBy=newest"
          className={
            styles.link
          }
        >
          مشاهده همه

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline
              points="15 18 9 12 15 6"
            />
          </svg>
        </Link>
      </div>

      <div
        className={
          styles.scrollContainer
        }
        ref={
          scrollContainerRef
        }
      >
        {products.map(
          (product:any) => (
            <div
              key={
                product.productId
              }
              className={
                styles.cardWrapper
              }
            >
              <ProductCard
                product={
                  product
                }
              />
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default NewestProductsSection;