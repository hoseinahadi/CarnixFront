'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import ProductCard from '@/components/product/productCard/ProductCard';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';

import {
  selectDiscountedLoading,
  selectDiscountedProducts,
  selectDiscountedStatus,
  selectFeaturedLoading,
  selectFeaturedProducts,
  selectFeaturedStatus,
} from '@/store/feature/product/productSelectors';

import {
  getDiscountedProductsPaged,
  getFeaturedProductsPaged,
} from '@/store/feature/product/productThunks';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

import styles from './FeaturedProductsSection.module.scss';
import { Product } from '@/models/product/Product';

type ProductTab =
  | 'featured'
  | 'discounted';

const FeaturedProductsSection =
  () => {
    const dispatch =
      useAppDispatch();

    // ==========================================================
    // FEATURED STATE
    // ==========================================================

    const featuredData =
      useAppSelector(
        selectFeaturedProducts,
      );

    const featuredLoading =
      useAppSelector(
        selectFeaturedLoading,
      );

    const featuredStatus =
      useAppSelector(
        selectFeaturedStatus,
      );

    // ==========================================================
    // DISCOUNTED STATE
    // ==========================================================

    const discountedData =
      useAppSelector(
        selectDiscountedProducts,
      );

    const discountedLoading =
      useAppSelector(
        selectDiscountedLoading,
      );

    const discountedStatus =
      useAppSelector(
        selectDiscountedStatus,
      );

    // ==========================================================
    // ACTIVE TAB
    // ==========================================================

    const [
      activeTab,
      setActiveTab,
    ] =
      useState<ProductTab>(
        'featured',
      );

    const scrollContainerRef =
      useHorizontalDragScroll<HTMLDivElement>(
        styles.active,
      );

    // ==========================================================
    // LOAD FEATURED
    // ==========================================================

    useEffect(() => {
      /*
       * فقط در صورتی که:
       *
       * 1. تب Featured فعال باشد
       * 2. قبلاً Request شروع نشده باشد
       *
       * Request ارسال می‌شود.
       *
       * request.abort() در cleanup وجود ندارد.
       *
       * چون featuredStatus بعد از dispatch
       * از idle به loading تغییر می‌کند و cleanup
       * Effect قبلی Request را Cancel می‌کرد.
       */
      if (
        activeTab !==
        'featured'
      ) {
        return;
      }

      if (
        featuredStatus !==
        'idle'
      ) {
        return;
      }

      void dispatch(
        getFeaturedProductsPaged({
          pageNumber: 1,
          pageSize: 10,
        }),
      );
    }, [
      activeTab,
      dispatch,
      featuredStatus,
    ]);

    // ==========================================================
    // LOAD DISCOUNTED
    // ==========================================================

    useEffect(() => {
      /*
       * تخفیف‌دارها Lazy Load می‌شوند.
       *
       * یعنی تا وقتی کاربر تب تخفیف‌دار را باز نکند
       * Request اضافی به Backend ارسال نمی‌شود.
       */
      if (
        activeTab !==
        'discounted'
      ) {
        return;
      }

      if (
        discountedStatus !==
        'idle'
      ) {
        return;
      }

      void dispatch(
        getDiscountedProductsPaged({
          pageNumber: 1,
          pageSize: 10,
        }),
      );
    }, [
      activeTab,
      discountedStatus,
      dispatch,
    ]);

    // ==========================================================
    // CURRENT TAB DATA
    // ==========================================================

    const isFeatured =
      activeTab ===
      'featured';

    const isLoading =
      isFeatured
        ? featuredLoading
        : discountedLoading;

    const products =
      isFeatured
        ? featuredData?.items ??
          []
        : discountedData?.items ??
          [];

    // ==========================================================
    // VIEW ALL URL
    // ==========================================================

    const viewAllHref =
      isFeatured
        ? '/products?sortBy=featured'
        : '/products?sortBy=discounted';

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
      <section
        className={
          styles.featuredSection
        }
      >
        <div
          className={
            styles.container
          }
        >
          {/* HEADER */}
          <div
            className={
              styles.header
            }
          >
            <div
              className={
                styles.headerTop
              }
            >
              <h2
                className={
                  styles.title
                }
              >
                محصولات ویژه
              </h2>

              <Link
                href={
                  viewAllHref
                }
                className={
                  styles.viewAllLink
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

            {/* TABS */}
            <div
              className={
                styles.tabsWrapper
              }
            >
              <div
                className={
                  styles.tabs
                }
              >
                <button
                  type="button"
                  className={`${styles.tabBtn} ${
                    activeTab ===
                    'featured'
                      ? styles.activeTab
                      : ''
                  }`}
                  onClick={() => {
                    setActiveTab(
                      'featured',
                    );
                  }}
                >
                  محصولات ویژه
                </button>

                <button
                  type="button"
                  className={`${styles.tabBtn} ${
                    activeTab ===
                    'discounted'
                      ? styles.activeTab
                      : ''
                  }`}
                  onClick={() => {
                    setActiveTab(
                      'discounted',
                    );
                  }}
                >
                  تخفیف‌دار
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCTS */}
          <div
            className={
              styles.scrollContainer
            }
            ref={
              scrollContainerRef
            }
          >
            {isLoading ? (
              Array.from({
                length: 5,
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
              )
            ) : products.length ===
              0 ? (
              <div
                className={
                  styles.emptyState
                }
              >
                <p>
                  محصولی یافت نشد
                </p>
              </div>
            ) : (
              products.map(
                (
                  product: Product,
                ) => (
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
              )
            )}
          </div>
        </div>
      </section>
    );
  };

export default FeaturedProductsSection;