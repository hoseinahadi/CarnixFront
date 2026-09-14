'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, LayoutGrid, Search, X } from 'lucide-react'

import type { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchCategories } from '@/store/feature/Category/categoryThunks'
import type { Category } from '@/models/category/Category'
import styles from '../brands/BrandsPage.module.scss'

const extractCategories = (value: unknown): Category[] => {
  if (Array.isArray(value)) return value as Category[]
  if (!value || typeof value !== 'object') return []

  const record = value as Record<string, unknown>
  for (const candidate of [record.items, record.data, record.mainResults]) {
    if (Array.isArray(candidate)) return candidate as Category[]
    if (candidate && typeof candidate === 'object' && Array.isArray((candidate as Record<string, unknown>).items)) {
      return (candidate as Record<string, unknown>).items as Category[]
    }
  }

  return []
}

const categoryKey = (category: Category): string =>
  category.slug?.trim() || String(category.categoryId)

export default function CategoriesPage() {
  const dispatch = useAppDispatch()
  const rawCategories = useAppSelector((state: RootState) => state.category.categories)
  const loading = useAppSelector((state: RootState) => state.category.loading)
  const fetchStatus = useAppSelector((state: RootState) => state.category.fetchStatus)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (fetchStatus === 'idle') void dispatch(fetchCategories())
  }, [dispatch, fetchStatus])

  const categories = useMemo(() => {
    const all = extractCategories(rawCategories)
    return all
      .filter((category) => category.isActive !== false && (!category.parentCategoryId || category.parentCategoryId === 0))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  }, [rawCategories])

  const visibleCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase()
    if (!query) return categories
    return categories.filter((category) => category.name?.toLocaleLowerCase().includes(query))
  }, [categories, searchTerm])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleSection}>
          <div className={styles.iconWrapper}>
            <LayoutGrid size={24} className={styles.headerIcon} />
          </div>
          <h1 className={styles.pageTitle}>دسته‌بندی محصولات</h1>
        </div>

        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="جستجوی دسته‌بندی..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm('')} className={styles.clearSearchBtn} aria-label="پاک کردن جستجو">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading && categories.length === 0 ? (
        <div className={styles.gridContainer}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className={styles.skeletonCard}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonLineTitle} />
                <div className={styles.skeletonLineSub} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {visibleCategories.map((category) => (
            <Link
              key={category.categoryId}
              className={styles.brandCard}
              href={`/products/${encodeURIComponent(categoryKey(category))}`}
              aria-label={`مشاهده محصولات دسته ${category.name}`}
            >
              <div className={styles.iconBox}>
                <LayoutGrid size={28} strokeWidth={1.5} className={styles.defaultIcon} />
              </div>
              <div className={styles.brandInfo}>
                <span className={styles.brandName}>{category.name}</span>
                <span className={styles.brandCountry}>
                  {category.subCategories?.length ? `${category.subCategories.length.toLocaleString('fa-IR')} زیردسته` : 'مشاهده محصولات'}
                </span>
              </div>
              <ChevronLeft size={18} className={styles.categoryArrow} />
            </Link>
          ))}

          {visibleCategories.length === 0 && (
            <div className={styles.emptyState}>
              <LayoutGrid size={48} strokeWidth={1} className={styles.emptyIcon} />
              <span>{searchTerm ? 'دسته‌بندی‌ای با این نام یافت نشد.' : 'دسته‌بندی‌ای ثبت نشده است.'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
