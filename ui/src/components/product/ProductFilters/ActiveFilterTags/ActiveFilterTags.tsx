// components/product/ProductFilters/ActiveFilterTags/ActiveFilterTags.tsx
import React from 'react'
import styles from './ActiveFilterTags.module.scss'
import { IconX } from '@tabler/icons-react'

interface ActiveFilterTagsProps {
  filters: any
  categories: any[]
  brands: any[]
  onRemove: (key: string) => void
  onClearAll: () => void
}

const ActiveFilterTags = ({ filters, categories, brands, onRemove, onClearAll }: ActiveFilterTagsProps) => {
  const tags: { key: string; label: string }[] = []

  if (filters.categoryId) {
    const cat = categories.find(c => c.categoryId === filters.categoryId)
    tags.push({ key: 'categoryId', label: cat?.name || `دسته ${filters.categoryId}` })
  }
  if (filters.brandId) {
    const brand = brands.find(b => b.brandId === filters.brandId)
    tags.push({ key: 'brandId', label: brand?.name || `برند ${filters.brandId}` })
  }
  if (filters.inStock) {
    tags.push({ key: 'inStock', label: 'کالاهای موجود' })
  }
  if (filters.hasDiscount) {
    tags.push({ key: 'hasDiscount', label: 'تخفیف‌دار' })
  }
  if (filters.minPrice || filters.maxPrice) {
    const formatPrice = (p: number) => new Intl.NumberFormat('fa-IR').format(Math.round(p))
    const label = `قیمت: ${formatPrice(filters.minPrice || 0)} - ${formatPrice(filters.maxPrice || 0)}`
    tags.push({ key: 'price', label })
  }

  if (tags.length === 0) return null

  return (
    <div className={styles.container}>
      {tags.map(tag => (
        <span key={tag.key} className={styles.tag}>
          {tag.label}
          <button onClick={() => onRemove(tag.key)} className={styles.removeBtn}>
            <IconX size={12} />
          </button>
        </span>
      ))}
    </div>
  )
}

export default ActiveFilterTags