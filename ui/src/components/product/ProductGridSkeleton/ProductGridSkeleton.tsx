// src/components/product/ProductGrid/ProductGridSkeleton.tsx
import React from 'react'
import styles from './ProductGridSkeleton.module.scss'

const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
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

export default ProductGridSkeleton