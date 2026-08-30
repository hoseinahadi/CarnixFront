'use client'

import { useMemo } from 'react'
import type { Brand } from '@/models/brand/Brand'
import { Link } from '@/components/common/Link/Link'
import styles from './BrandDropdown.module.scss'
import { ShieldCheck, Tag, ChevronLeft } from 'lucide-react'

type Props = {
  brands: Brand[]
}

const BrandDropdown = ({ brands }: Props) => {
  // فیلتر برندهای فعال و مرتب‌سازی
  const activeBrands = useMemo(
    () => brands.filter(b => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
    [brands]
  )

  return (
    <div className={styles.megaMenu}>
      {/* هدر منو */}
      <div className={styles.header}>
        <div className={styles.headerRight}>
          <Tag size={20} className={styles.headerIcon} />
          <h3 className={styles.headerTitle}>برندهای معتبر</h3>
        </div>
        
        <Link href="/brands" className={styles.viewAllBtn}>
          مشاهده همه برندها
          <ChevronLeft size={16} />
        </Link>
      </div>

      {/* لیست برندها با ساختار گرید */}
      <div className={styles.gridContainer}>
        {activeBrands.map(brand => (
          <Link
            key={brand.brandId}
            href={`/products?brandId=${brand.brandId}`}
            className={styles.brandCard}
          >
            {/* باکس آیکون/لوگو با پس‌زمینه آبی */}
            <div className={styles.iconBox}>
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className={styles.logoImage} />
              ) : (
                <ShieldCheck size={24} strokeWidth={1.5} className={styles.defaultIcon} />
              )}
            </div>

            {/* اطلاعات برند */}
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
      </div>
      
      {activeBrands.length === 0 && (
         <div className={styles.emptyState}>برندی یافت نشد.</div>
      )}
    </div>
  )
}

export default BrandDropdown
