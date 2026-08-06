'use client';

import { useState } from 'react';

import Link from 'next/link';

import { IconFilter } from '@tabler/icons-react';

import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import ProductSort from '@/components/product/ProductSort/ProductSort';

import { useProductListingController } from '@/features/product/hooks/useProductListingController';

import styles from './ProductsPage.module.scss';

export default function ProductsContent() {
  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  const {
    products,
    totalCount,
    currentPage,
    totalPages,
    showSkeleton,
    navigateToFilters,
    clearFilters,
    changePage,
    changeSort,
  } = useProductListingController();

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">خانه</Link>
        <span>/</span>
        <Link href="/products">محصولات</Link>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ProductFilters
            onFiltersChange={navigateToFilters}
            onClearAll={clearFilters}
          />
        </aside>

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerRight}>
              <h1 className={styles.title}>
                محصولات
              </h1>

              {!showSkeleton && totalCount > 0 && (
                <span className={styles.count}>
                  {totalCount.toLocaleString('fa-IR')} کالا
                </span>
              )}
            </div>

            <div className={styles.headerLeft}>
              <ProductSort
                onSortChange={changeSort}
              />
            </div>

            <div className={styles.mobileSort}>
              <ProductSort
                onSortChange={changeSort}
              />

              <button
                type="button"
                className={styles.filterToggle}
                onClick={() => setMobileFilterOpen(true)}
                aria-label="فیلترها"
              >
                <IconFilter size={20} />
              </button>
            </div>
          </div>

          <ProductGrid
            products={products}
            loading={showSkeleton}
          />

          {!showSkeleton && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() =>
                  changePage(currentPage - 1)
                }
              >
                قبلی
              </button>

              {Array.from(
                {
                  length: Math.min(totalPages, 5),
                },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`${styles.pageBtn} ${
                    pageNumber === currentPage
                      ? styles.active
                      : ''
                  }`}
                  onClick={() =>
                    changePage(pageNumber)
                  }
                >
                  {pageNumber.toLocaleString('fa-IR')}
                </button>
              ))}

              {totalPages > 5 && (
                <>
                  <span className={styles.dots}>...</span>

                  <button
                    type="button"
                    className={styles.pageBtn}
                    onClick={() =>
                      changePage(totalPages)
                    }
                  >
                    {totalPages.toLocaleString('fa-IR')}
                  </button>
                </>
              )}

              <button
                type="button"
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() =>
                  changePage(currentPage + 1)
                }
              >
                بعدی
              </button>
            </div>
          )}
        </main>
      </div>

      {mobileFilterOpen && (
        <div
          className={styles.filterOverlay}
          onClick={() => setMobileFilterOpen(false)}
        >
          <div
            className={styles.filterDrawer}
            onClick={(event) => event.stopPropagation()}
          >
            <ProductFilters
              isMobile
              onClose={() => setMobileFilterOpen(false)}
              onFiltersChange={navigateToFilters}
              onClearAll={clearFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
}
