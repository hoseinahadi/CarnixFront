'use client'

import React from 'react'
import styles from './ProductSpecifications.module.scss'

interface Specification {
  featureValueId: number
  featureName: string
  valueString?: string
  valueNumeric?: number
}

interface ProductSpecificationsProps {
  specifications: Specification[]
}

const ProductSpecifications = ({ specifications }: ProductSpecificationsProps) => {
  if (!specifications || specifications.length === 0) {
    return (
      <div className={styles.empty}>
        <p>مشخصات فنی برای این محصول ثبت نشده است.</p>
      </div>
    )
  }

  return (
    <div className={styles.specContainer}>
      <h3 className={styles.title}>مشخصات فنی</h3>
      
      <div className={styles.specTable}>
        {specifications.map((spec, index) => (
          <div key={spec.featureValueId || index} className={styles.specRow}>
            <div className={styles.specLabel}>
              <span>{spec.featureName}</span>
            </div>
            <div className={styles.specValue}>
              <span>{spec.valueString || spec.valueNumeric || '-'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductSpecifications