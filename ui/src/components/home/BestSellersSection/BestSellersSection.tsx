'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import ProductCard from '@/components/product/productCard/ProductCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

import {
  selectBestSellers,
  selectBestSellersLoading,
  selectBestSellersStatus,
} from '@/store/feature/product/productSelectors';

import {
  getBestSellingProducts,
} from '@/store/feature/product/productThunks';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import styles from './BestSellersSection.module.scss';

const BestSellersSection = () => {
  const dispatch =
    useAppDispatch();

  const bestSellers =
    useAppSelector(
      selectBestSellers,
    );

  const loading =
    useAppSelector(
      selectBestSellersLoading,
    );

  const status =
    useAppSelector(
      selectBestSellersStatus,
    );

  const scrollContainerRef =
    useHorizontalDragScroll<HTMLDivElement>(
      styles.active,
    );

  // ============================================================
  // LOAD BEST SELLERS
  // ============================================================

  useEffect(() => {
    /*
     * Request فقط یک بار در حالت idle.
     *
     * cleanup با request.abort() عمداً حذف شده،
     * چون تغییر status از idle به loading باعث
     * cleanup همان effect می‌شد و Request را
     * بلافاصله Cancel می‌کرد.
     */
    if (status !== 'idle') {
      return;
    }

    void dispatch(
      getBestSellingProducts({
        pageNumber: 1,
        pageSize: 8,

        /*
         * حتی اگر هنوز TotalSales بعضی محصولات
         * مقدار مناسبی ندارد، لیست خالی نشود.
         */
        includeAll: true,
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
    bestSellers?.items ??
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
            پرفروش‌ترین محصولات
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
          پرفروش‌ترین محصولات
        </h2>

        <Link
          href="/products?sortBy=bestsellers"
          className={
            styles.viewAll
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

export default BestSellersSection;