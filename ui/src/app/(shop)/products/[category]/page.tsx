// app/products/[category]/page.tsx
'use client'

import React, { useEffect, useCallback, useState, useRef, use } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchFilteredProducts, setFilters, setPage } from '@/store/feature/product/productFilterSlice'
import {
  selectFilteredProducts,
  selectFilteredLoading,
  selectFilteredTotalCount,
  selectFilteredCurrentPage,
  selectFilteredTotalPages,
  selectActiveFilters,
} from '@/store/feature/product/productFilterSelectors'
import ProductGrid from '@/components/product/ProductGrid/ProductGrid'
import ProductFilters from '@/components/product/ProductFilters/ProductFilters'
import ProductSort from '@/components/product/ProductSort/ProductSort'
import styles from '../ProductsPage.module.scss'
import { IconFilter } from '@tabler/icons-react'

interface PageProps {
  params: Promise<{ category: string }>
}

export default function CategoryProductsPage({ params }: PageProps) {
  const dispatch = useAppDispatch()
  const resolvedParams = use(params)
  const categorySlug = resolvedParams.category

  const products = useAppSelector(selectFilteredProducts)
  const loading = useAppSelector(selectFilteredLoading)
  const totalCount = useAppSelector(selectFilteredTotalCount)
  const currentPage = useAppSelector(selectFilteredCurrentPage)
  const totalPages = useAppSelector(selectFilteredTotalPages)
  const activeFilters = useAppSelector(selectActiveFilters)

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [initialLoaded, setInitialLoaded] = useState(false)

  const isInitialized = useRef(false)

  const isNumeric = /^\d+$/.test(categorySlug)
  const categoryId = isNumeric ? Number(categorySlug) : null

  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    const setupAndFetch = async () => {
      let finalCategoryId: number | null = categoryId

      if (!isNumeric) {
        try {
          const { CategoryApi } = await import('@/features/category/api/routes')
          const res = await CategoryApi.getAll()
          if (res.data?.isSuccess) {
            const category = res.data.data.find(
              (c: any) => c.name === categorySlug || c.slug === categorySlug
            )
            if (category) {
              setCategoryName(category.name)
              finalCategoryId = category.categoryId
            }
          }
        } catch (err) {
          console.error('Failed to fetch category', err)
        }
      } else if (categoryId) {
        try {
          const { CategoryApi } = await import('@/features/category/api/routes')
          const res = await CategoryApi.getAll()
          if (res.data?.isSuccess) {
            const category = res.data.data.find((c: any) => c.categoryId === categoryId)
            if (category) setCategoryName(category.name)
          }
        } catch (err) {
          console.error('Failed to fetch category name', err)
        }
      }

      if (finalCategoryId) {
        dispatch(fetchFilteredProducts({
          categoryId: finalCategoryId,
          sortBy: 'newest',
          page: 1,
          pageSize: 20,
        }))
      }

      setInitialLoaded(true)
    }

    setupAndFetch()
  }, [categorySlug, dispatch])

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page))
    dispatch(fetchFilteredProducts({ ...activeFilters, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [dispatch, activeFilters])

  if (!initialLoaded && loading) {
    return null
  }

  return (
    <div className={styles.page}>
      {/* بردکرامب */}
      <div className={styles.breadcrumb}>
        <a href="/">خانه</a>
        <span>/</span>
        <a href="/products">محصولات</a>
        <span>/</span>
        <span>{categoryName || categorySlug}</span>
      </div>

      <div className={styles.content}>
        {/* سایدبار فیلترها - فقط دسکتاپ */}
        <aside className={styles.sidebar}>
          <ProductFilters />
        </aside>

        {/* محتوای اصلی */}
        <main className={styles.main}>
          {/* هدر با عنوان + تعداد + مرتب‌سازی */}
          <div className={styles.header}>
            {/* عنوان و تعداد */}
            <div className={styles.headerRight}>
              <h1 className={styles.title}>{categoryName || categorySlug}</h1>
              <span className={styles.count}>{totalCount.toLocaleString('fa-IR')} کالا</span>
            </div>

            {/* مرتب‌سازی - فقط دسکتاپ */}
            <div className={styles.desktopSort}>
              <ProductSort />
            </div>

            {/* مرتب‌سازی + فیلتر - موبایل (فقط آیکون) */}
            <div className={styles.mobileSort}>
              <ProductSort />
              <button
                className={styles.filterToggle}
                onClick={() => setMobileFilterOpen(true)}
                aria-label="فیلترها"
              >
                <IconFilter size={20} />
              </button>
            </div>
          </div>

          {/* گرید محصولات */}
          <ProductGrid products={products} loading={loading} />

          {/* پاگینیشن */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                قبلی
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button
                  key={i + 1}
                  className={`${styles.pageBtn} ${i + 1 === currentPage ? styles.active : ''}`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {(i + 1).toLocaleString('fa-IR')}
                </button>
              ))}

              {totalPages > 5 && (
                <>
                  <span className={styles.dots}>...</span>
                  <button
                    className={styles.pageBtn}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages.toLocaleString('fa-IR')}
                  </button>
                </>
              )}

              <button
                className={styles.pageBtn}
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                بعدی
              </button>
            </div>
          )}
        </main>
      </div>

      {/* دراور فیلتر موبایل */}
      {mobileFilterOpen && (
        <div className={styles.filterOverlay} onClick={() => setMobileFilterOpen(false)}>
          <div className={styles.filterDrawer} onClick={(e) => e.stopPropagation()}>
            <ProductFilters isMobile onClose={() => setMobileFilterOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}