'use client'

import { useMemo, useState, useEffect } from 'react'
import type { Category } from '@/models/category/Category'
import { Link } from '@/components/common/Link/Link'
import styles from './DropdownMenu.module.scss'
import classNames from 'classnames'
import {
  Grid, Settings, Zap, CarFront, Activity, Disc, GitMerge, Droplet, Loader2
} from 'lucide-react'

type Props = {
  categories: Category[]
  isLoading?: boolean // 🟢 پراپ جدید برای مدیریت زمان هاور اولیه
}

const getDropdownIcon = (categoryId: number) => {
  switch (categoryId) {
    case 37: return <Settings size={18} />; 
    case 38: return <Zap size={18} />; 
    case 39: return <CarFront size={18} />; 
    case 40: return <Activity size={18} />; 
    case 41: return <Disc size={18} />; 
    case 42: return <GitMerge size={18} />; 
    case 43: return <Droplet size={18} />; 
    default: return <Grid size={18} />; 
  }
}

const DropdownMenu = ({ categories, isLoading }: Props) => {
  const rootCategories = useMemo(
    () => categories.filter(c => !c.parentCategoryId || c.parentCategoryId === 0),
    [categories]
  )
  
  const [active, setActive] = useState<Category | null>(null)

  // 🌟 وقتی هاور انجام شد و دیتا از بک‌اند رسید، به صورت اتوماتیک تب اول فعال شود
  useEffect(() => {
    if (rootCategories.length > 0 && !active) {
      setActive(rootCategories[0])
    }
  }, [rootCategories, active])

  function splitToColumns<T>(arr: T[]): T[][] {
    const mid = Math.ceil(arr.length / 2)
    return [arr.slice(0, mid), arr.slice(mid)]
  }

  // نمایش وضعیت لودینگ هنگام هاور قبل از دریافت دیتا
  if (isLoading || categories.length === 0) {
    return (
      <div className={styles.megaMenu} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem' }}>
        <Loader2 className="animate-spin" size={24} style={{ color: '#2563eb', marginLeft: '10px' }} />
        <span style={{ color: '#6b7280', fontSize: '16px' }}>در حال بارگذاری دسته‌بندی‌ها...</span>
      </div>
    )
  }

  return (
    <div className={styles.megaMenu}>
      {/* ستون اصلی */}
      <div className={styles.main}>
        {rootCategories.map(cat => (
          <div
            key={cat.categoryId}
            className={classNames(styles.mainItem, {
              [styles.active]: cat.categoryId === active?.categoryId
            })}
            onMouseEnter={() => setActive(cat)}
          >
            <span className={styles.icon}>
              {getDropdownIcon(cat.categoryId)}
            </span>
            <span className={styles.label}>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* بخش ساب کت ها */}
      <div className={styles.sub}>
        {active?.subCategories?.map(sub => {
          const children = sub.subCategories ?? [];
          const limited = children.slice(0, 6);
          const [col1, col2] = splitToColumns(limited);

          return (
            <div className={styles.subWrapper} key={sub.categoryId}>
              <div className={styles.subTitle}>
                <Link href={`/products/${sub.categoryId}`}>{sub.name}</Link>
              </div>

              <div className={styles.subContent}>
                <div className={styles.subColumn}>
                  {col1.map(child => (
                    <Link
                      key={child.categoryId}
                      href={`/products/${child.categoryId}`}
                      className={styles.item}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>

                {col2.length > 0 && <span className={styles.verticalDivider} />}

                <div className={styles.subColumn}>
                  {col2.map(child => (
                    <Link
                      key={child.categoryId}
                      href={`/products/${ child.categoryId}`}
                      className={styles.item}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* مشاهده همه */}
              {children.length >= 0 && (
                <Link
                  href={`/products/${sub.categoryId}`}
                  className={styles.viewAll}
                >
                  مشاهده همه
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DropdownMenu