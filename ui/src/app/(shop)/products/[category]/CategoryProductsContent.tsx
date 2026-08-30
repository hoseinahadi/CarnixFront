'use client';

import { use, useState } from 'react';

import Link from 'next/link';
import { IconFilter } from '@tabler/icons-react';

import ProductFilters from '@/components/product/ProductFilters/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import ProductSort from '@/components/product/ProductSort/ProductSort';
import { useProductListingController } from '@/features/product/hooks/useProductListingController';
import styles from '../ProductsPage.module.scss';

interface CategoryProductsContentProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryProductsContent({
  params,
}: CategoryProductsContentProps) {
  const { category } = use(params);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const {
    products,
    totalCount,
    currentPage,
    totalPages,
    showSkeleton,
    displayTitle,
    categoryNotFound,
    categoryResolutionError,
    categoriesError,
    navigateToFilters,
    clearFilters,
    changePage,
    changeSort,
  } = useProductListingController({
    categorySlug: category,
  });
console.log("FFFFFFFFFFFFFFFFFFF")
console.log(products)

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href="/">خانه</Link>
        <span>/</span>
        <Link href="/products">محصولات</Link>
        <span>/</span>
        <span>{displayTitle}</span>
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
                {displayTitle}
              </h1>

              {!showSkeleton && totalCount > 0 && (
                <span className={styles.count}>
                  {totalCount.toLocaleString('fa-IR')} کالا
                </span>
              )}
            </div>

            <div className={styles.desktopSort}>
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

          {categoryResolutionError ? (
            <div
              role="alert"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              {categoriesError ||
                'دریافت اطلاعات دسته‌بندی ناموفق بود.'}
            </div>
          ) : categoryNotFound ? (
            <div
              role="status"
              style={{
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              دسته‌بندی موردنظر پیدا نشد.
            </div>
          ) : (
            <ProductGrid
              products={products}
              loading={showSkeleton}
            />
          )}

          {!categoryNotFound &&
            !categoryResolutionError &&
            !showSkeleton &&
            totalPages > 1 && (
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