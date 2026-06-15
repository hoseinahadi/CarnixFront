'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchFilteredProducts, setFilters, clearFilters } from '@/store/feature/product/productFilterSlice'
import { 
  selectFilteredProducts, 
  selectFilteredLoading, 
  selectActiveFilters,
  selectFilteredTotalCount 
} from '@/store/feature/product/productFilterSelectors'
import ProductGrid from '@/components/product/ProductGrid/ProductGrid'
import ProductFilters from '@/components/product/ProductFilters/ProductFilters'
import ProductSort from '@/components/product/ProductSort/ProductSort'
import styles from './ProductsPage.module.scss'
import { IconFilter } from '@tabler/icons-react'

export default function ProductsPage() {
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  
  const products = useAppSelector(selectFilteredProducts)
  const loading = useAppSelector(selectFilteredLoading)
  const activeFilters = useAppSelector(selectActiveFilters)
  const totalCount = useAppSelector(selectFilteredTotalCount)

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // دریافت پارامترهای URL
  const makeParam = searchParams.get('make')
  const modelParam = searchParams.get('model')
  const sortByParam = searchParams.get('sortBy')
  const categoryIdParam = searchParams.get('categoryId')
  const brandIdParam = searchParams.get('brandId')

  // تنظیم فیلترها بر اساس پارامترهای URL در اولین لود
  useEffect(() => {
    if (!initialized) {
      const initialFilters = {
        ...activeFilters,
        makeId: makeParam ? Number(makeParam) : undefined,
        modelId: modelParam ? Number(modelParam) : undefined,
        sortBy: sortByParam || 'newest',
        categoryId: categoryIdParam ? Number(categoryIdParam) : undefined,
        brandId: brandIdParam ? Number(brandIdParam) : undefined,
        page: 1
      }
      dispatch(setFilters(initialFilters))
      dispatch(fetchFilteredProducts(initialFilters))
      setInitialized(true)
    }
  }, [dispatch, makeParam, modelParam, sortByParam, categoryIdParam, brandIdParam, initialized])

  // وقتی فیلترها تغییر می‌کنند، محصولات را دوباره fetch کن
  useEffect(() => {
    if (initialized) {
      dispatch(fetchFilteredProducts(activeFilters))
    }
  }, [dispatch, activeFilters, initialized])

  // پاک کردن همه فیلترها
  const handleClearFilters = () => {
    dispatch(clearFilters())
    const emptyFilters = {
      categoryId: undefined,
      brandId: undefined,
      makeId: undefined,
      modelId: undefined,
      inStock: undefined,
      hasDiscount: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'newest',
      page: 1
    }
    dispatch(fetchFilteredProducts(emptyFilters))
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="/">خانه</a>
        <span>/</span>
        <a href="/products">محصولات</a>
      </div>

      

      {/* Mobile Sort & Filter Toggle */}
      <div className={styles.mobileSort}>
        
        <button className={styles.filterToggle} onClick={() => setMobileFilterOpen(true)}>
          <IconFilter size={20} />
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Sidebar - Desktop */}
        <aside className={styles.sidebar}>
          <ProductFilters onClearAll={handleClearFilters} />
        </aside>

        {/* Main Products Grid */}
        <main className={styles.main}>
          {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerRight}>
          <h1 className={styles.title}>محصولات</h1>
          <span className={styles.count}>{totalCount.toLocaleString('fa-IR')} کالا</span>
        </div>
        <div className={styles.headerLeft}>
          <ProductSort />
        </div>
      </div>
          <ProductGrid products={products} loading={loading} />
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className={styles.filterOverlay} onClick={() => setMobileFilterOpen(false)}>
          <div className={styles.filterDrawer} onClick={(e) => e.stopPropagation()}>
            <ProductFilters 
              isMobile 
              onClose={() => setMobileFilterOpen(false)}
              onClearAll={handleClearFilters}
            />
          </div>
        </div>
      )}
    </div>
  )
}