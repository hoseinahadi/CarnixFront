'use client'

import React, { useMemo } from 'react'
import { Info } from 'lucide-react'
import styles from './ProductSpecifications.module.scss'

interface Specification {
  featureValueId?: number
  featureId?: number
  featureName: string
  valueString?: string | null
  valueNumeric?: number | null
  optionName?: string | null
  unit?: string | null
  source?: string
}

interface ProductSpecificationsProps {
  specifications: Specification[]
}

export default function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  
  const { productSpecs, categorySpecs, hasAnyValue } = useMemo(() => {
    if (!specifications || specifications.length === 0) {
      return { productSpecs: [], categorySpecs: [], hasAnyValue: false }
    }

    const product: Specification[] = []
    const category: Specification[] = []
    const productFeatureIds = new Set<number>()
    let hasValue = false

    // اول Product specs رو پردازش کن
    specifications.forEach(spec => {
      const value = spec.optionName || spec.valueString || spec.valueNumeric
      const isValid = value !== undefined && value !== null && value !== '' && value !== '-'
      
      
      if (isValid) {
        hasValue = true
        if (spec.source === 'Product') {
          product.push(spec)
          if (spec.featureId) productFeatureIds.add(spec.featureId)
        }
      }
    })

    // بعد Category specs که تکراری نباشن
    specifications.forEach(spec => {
      const value = spec.optionName || spec.valueString || spec.valueNumeric
      const isValid = value !== undefined && value !== null && value !== '' && value !== '-'
      
      if (isValid && spec.source !== 'Product' && spec.featureId && !productFeatureIds.has(spec.featureId)) {
        category.push(spec)
      }
    })


    return {
      productSpecs: product,
      categorySpecs: category,
      hasAnyValue: hasValue
    }
  }, [specifications])

  // خالی بودن کل specifications
  if (!specifications || specifications.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Info size={32} className={styles.emptyIcon} />
        <p>مشخصات فنی برای این محصول ثبت نشده است.</p>
      </div>
    )
  }

  // همه مقادیر خالی هستن
  if (!hasAnyValue) {
    return (
      <div className={styles.emptyContainer}>
        <Info size={32} className={styles.emptyIcon} />
        <p>مشخصات فنی این محصول به زودی تکمیل خواهد شد.</p>
        <p className={styles.hint}>لطفاً از طریق نظرات، سوالات خود را مطرح کنید.</p>
      </div>
    )
  }

  return (
    <div className={styles.specContainer}>
      {productSpecs.length > 0 && (
        <div className={styles.specSection}>
          <h3 className={styles.title}>مشخصات فنی محصول</h3>
          <div className={styles.specList}>
            {productSpecs.map((spec, index) => {
              const value = spec.optionName || spec.valueString || spec.valueNumeric
              if (!value || value === '-') return null
              
              return (
                <div 
                  key={spec.featureValueId || `product-${spec.featureId}-${index}`} 
                  className={styles.specRow}
                >
                  <div className={styles.specKey}>
                    <span>{spec.featureName}</span>
                  </div>
                  <div className={styles.specValue}>
                    <span>
                      {value}
                      {spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {categorySpecs.length > 0 && (
        <div className={styles.specSection}>
          <h3 className={styles.title}>
            {productSpecs.length > 0 ? 'مشخصات عمومی' : 'مشخصات فنی'}
          </h3>
          <div className={styles.specList}>
            {categorySpecs.map((spec, index) => {
              const value = spec.optionName || spec.valueString || spec.valueNumeric
              if (!value || value === '-') return null
              
              return (
                <div 
                  key={`category-${spec.featureId}-${index}`} 
                  className={styles.specRow}
                >
                  <div className={styles.specKey}>
                    <span>{spec.featureName}</span>
                  </div>
                  <div className={styles.specValue}>
                    <span>
                      {value}
                      {spec.unit ? ` ${spec.unit}` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}