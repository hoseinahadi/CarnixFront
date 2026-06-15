'use client'

import { JSX, useMemo, useState } from 'react'
import type { Category } from '@/models/category/Category'
import { Link } from '@/components/common/Link/Link'
import styles from './DropdownMenu.module.scss'
import classNames from 'classnames'
import {
  Car,
  Smartphone,
  Shirt,
  Laptop,
  Home,
  Grid
} from 'lucide-react'

type Props = {
  categories: Category[]
}

const categoryIcons: Record<string, JSX.Element> = {
  car: <Car size={18} />,
  mobile: <Smartphone size={18} />,
  fashion: <Shirt size={18} />,
  laptop: <Laptop size={18} />,
  home: <Home size={18} />,
}

const DropdownMenu = ({ categories }: Props) => {
  const rootCategories = useMemo(
    () => categories.filter(c => !c.parentCategoryId),
    [categories]
  )
  const [active, setActive] = useState<Category | null>(rootCategories[0] ?? null)

  function splitToColumns<T>(arr: T[]): T[][] {
    const mid = Math.ceil(arr.length / 2)
    return [arr.slice(0, mid), arr.slice(mid)]
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
              {categoryIcons[cat.slug] ?? <Grid size={18} />}
            </span>
            <span className={styles.label}>{cat.name}</span>
          </div>
        ))}
      </div>

      {/* بخش ساب کت ها */}
      <div className={styles.sub}>
        {active?.subCategories?.map(sub => {
          const children = sub.subCategories ?? [];

          // فقط ۵ عدد اول
          const limited = children.slice(0, 6);

          // تقسیم به دو ستون
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

                <span className={styles.verticalDivider} />

                <div className={styles.subColumn}>
                  {col2.map(child => (
                    <Link
                      key={child.categoryId}
                      href={`/products/${child.categoryId}`}
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
