// src/components/product/ProductGrid/ProductGrid.tsx
'use client'

import React from 'react'
import ProductCard from '@/components/product/productCard/ProductCard'
import styles from './ProductGrid.module.scss'
import { Product } from '@/models/product/Product'

interface ProductGridProps {
  products: Product[]
  loading: boolean
}

const ProductGrid = ({ products, loading }: ProductGridProps) => {
  // ⭐ اگه loading هست یا products undefined/null
  if (loading || !products) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle} />
              <div className={styles.skeletonPrice} />
              <div className={styles.skeletonButton} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ⭐ حالا products حتماً آرایه است
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <p className={styles.emptyTitle}>محصولی یافت نشد</p>
        <p className={styles.emptyDescription}>محصولی با این فیلترها یافت نشد. لطفاً فیلترهای دیگری را امتحان کنید.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.productId} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid