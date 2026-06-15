'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Tag, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getAllBrands } from '@/store/feature/brand/BrandThunks'
import { selectBrands } from '@/store/feature/brand/BrandSelectors'
import styles from './BrandsPage.module.scss'

const BrandsPage = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const brands = useAppSelector(selectBrands)

  useEffect(() => {
    if (brands.length === 0) {
      dispatch(getAllBrands())
    }
  }, [dispatch, brands.length])

  const activeBrands = useMemo(
    () => brands.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [brands]
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <button onClick={() => router.back()} className={styles.backButton}>
          <ArrowRight size={20} />
          بازگشت
        </button>
        
        <div className={styles.headerContent}>
          <Tag size={28} className={styles.headerIcon} />
          <h1 className={styles.pageTitle}>برندهای معتبر</h1>
        </div>
      </div>

      {/* گرید برندها */}
      <div className={styles.gridContainer}>
        {activeBrands.map(brand => (
          <div
            key={brand.brandId}
            className={styles.brandCard}
            onClick={() => router.push(`/brand/${brand.brandId}`)}
          >
            <div className={styles.iconBox}>
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className={styles.logoImage} />
              ) : (
                <ShieldCheck size={24} strokeWidth={1.5} className={styles.defaultIcon} />
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
          </div>
        ))}
        
        {activeBrands.length === 0 && (
          <div className={styles.emptyState}>برندی یافت نشد.</div>
        )}
      </div>
    </div>
  )
}

export default BrandsPage