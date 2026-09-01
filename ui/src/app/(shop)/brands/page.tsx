'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Tag, Search, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getAllBrands } from '@/store/feature/brand/BrandThunks'
import { selectBrands } from '@/store/feature/brand/BrandSelectors'
import styles from './BrandsPage.module.scss'
import type { RootState } from '@/store' 

// تابع استخراج‌گر ایمن
const extractSafeArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data; 
  if (Array.isArray(data.items)) return data.items; 
  if (Array.isArray(data.data)) return data.data; 
  if (Array.isArray(data.mainResults)) return data.mainResults; 
  if (data.data && Array.isArray(data.data.items)) return data.data.items; 
  if (data.mainResults && Array.isArray(data.mainResults.items)) return data.mainResults.items;
  return [];
};

// تابع هوشمند برای اتصال آدرس سرور بک‌اند به آدرس عکس
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.startsWith('http')) return url; 
  
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7191'; 
  
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 4);
  } else if (baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 5);
  }

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

const BrandsPage = () => {
  const dispatch = useAppDispatch()
  
  const rawBrands = useAppSelector(selectBrands)
  const loading = useAppSelector(
    (state: RootState) => state.brand?.loading || false,
  )
  const listStatus = useAppSelector(
    (state: RootState) => state.brand?.listStatus ?? 'idle',
  )

  const [searchTerm, setSearchTerm] = useState('')

  const safeBrandsArray = useMemo(() => extractSafeArray(rawBrands), [rawBrands]);

  useEffect(() => {
    if (listStatus === 'idle') {
      void dispatch(getAllBrands())
    }
  }, [dispatch, listStatus])

  const activeBrands = useMemo(() => {
    return safeBrandsArray
      .filter((b: any) => 
        b.isActive !== false && 
        (searchTerm.trim() === '' || (b.name && b.name.toLowerCase().includes(searchTerm.toLowerCase().trim())))
      )
      .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [safeBrandsArray, searchTerm])

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerTitleSection}>
          <div className={styles.iconWrapper}>
            <Tag size={24} className={styles.headerIcon} />
          </div>
          <h1 className={styles.pageTitle}>برندهای معتبر</h1>
        </div>

        <div className={styles.searchContainer}>
          <Search size={20} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="جستجوی برند..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} className={styles.clearSearchBtn} aria-label="پاک کردن جستجو">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className={styles.gridContainer}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className={styles.skeletonCard}>
              <div className={styles.skeletonIcon}></div>
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonLineTitle}></div>
                <div className={styles.skeletonLineSub}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.gridContainer}>
          {activeBrands.map((brand: any) => (
            <Link
              key={brand.brandId}
              className={styles.brandCard}
              href={`/products?brandId=${encodeURIComponent(String(brand.brandId))}`}
              aria-label={`مشاهده محصولات برند ${brand.name}`}
            >
              <div className={styles.iconBox}>
                {brand.logoUrl ? (
                  <img src={getImageUrl(brand.logoUrl)} alt={brand.name} className={styles.logoImage} loading="lazy" />
                ) : (
                  <ShieldCheck size={28} strokeWidth={1.5} className={styles.defaultIcon} />
                )}
              </div>

              <div className={styles.brandInfo}>
                <span className={styles.brandName}>{brand.name}</span>
                {brand.countryOfOrigin ? (
                  <span className={styles.brandCountry}>{brand.countryOfOrigin}</span>
                ) : (
                  <span className={styles.brandCountry}>برند تایید شده</span>
                )}
              </div>
            </Link>
          ))}
          
          {activeBrands.length === 0 && !loading && (
            <div className={styles.emptyState}>
              <ShieldCheck size={48} strokeWidth={1} className={styles.emptyIcon} />
              <span>{searchTerm ? 'برندی با این نام یافت نشد.' : 'برندی ثبت نشده است.'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BrandsPage
