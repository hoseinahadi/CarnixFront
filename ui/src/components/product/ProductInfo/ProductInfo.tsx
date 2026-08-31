'use client';

import React, { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  selectProductDetails,
  selectDetailsLoading
} from '@/store/feature/product/productSelectors';
import { ChevronLeft } from 'lucide-react';
import styles from './ProductInfo.module.scss';

interface ProductInfoProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function ProductInfo({
  onNavigateToTab
}: ProductInfoProps) {

  const product = useAppSelector(selectProductDetails);
  const isLoading = useAppSelector(selectDetailsLoading);

  useEffect(() => {
    if (product) {
      // debug
    }
  }, [product]);


  if (isLoading) {
    return (
      <div className={styles.loadingSkeleton}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonCode}></div>
        <div className={styles.skeletonGrid}></div>
      </div>
    );
  }


  if (!product) return null;


  const featureValues = product.featureValues ?? [];


  const filledFeatures = featureValues.filter(
    (fv) =>
      Boolean(fv.valueString) ||
      fv.valueNumeric !== undefined ||
      Boolean(fv.optionName)
  );


  const topFeatures = filledFeatures.slice(0, 4);


  return (
    <div className={styles.productInfo}>

      <div className={styles.header}>
        <h1 className={styles.title}>
          {product.productName}
        </h1>
      </div>


      {product.productCode && (
        <div className={styles.metaInfo}>
          <span className={styles.productCode}>
            کد قطعه : {product.productCode}
          </span>
        </div>
      )}



      {topFeatures.length > 0 ? (

        <div className={styles.featuresSection}>

          <h3 className={styles.featuresTitle}>
            ویژگی های محصول:
          </h3>


          <div className={styles.featuresGrid}>

            {topFeatures.map((fv, index) => (

              <div
                key={index}
                className={styles.featureItem}
              >

                <span className={styles.featureLabel}>
                  {fv.featureName}:
                </span>


                <span className={styles.featureValue}>

                  {
                    fv.optionName ||
                    fv.valueString ||
                    fv.valueNumeric ||
                    '-'
                  }


                  {fv.unit &&
                    ` ${fv.unit}`
                  }

                </span>

              </div>

            ))}

          </div>



          <button
            className={styles.viewAllBtn}
            onClick={() =>
              onNavigateToTab?.('specifications')
            }
          >

            مشاهده همه ویژگی‌ها

            <ChevronLeft size={14} />

          </button>


        </div>


      ) : (


        <div className={styles.featuresSection}>


          <h3 className={styles.featuresTitle}>
            اطلاعات محصول:
          </h3>


          <div className={styles.featuresGrid}>


            {product.brandName && (

              <div className={styles.featureItem}>

                <span className={styles.featureLabel}>
                  برند:
                </span>

                <span className={styles.featureValue}>
                  {product.brandName}
                </span>

              </div>

            )}



            {product.categoryName && (

              <div className={styles.featureItem}>

                <span className={styles.featureLabel}>
                  دسته‌بندی:
                </span>

                <span className={styles.featureValue}>
                  {product.categoryName}
                </span>

              </div>

            )}



            {product.totalStock > 0 && (

              <div className={styles.featureItem}>

                <span className={styles.featureLabel}>
                  موجودی:
                </span>

                <span className={styles.featureValue}>
                  {product.totalStock} عدد
                </span>

              </div>

            )}


          </div>


        </div>


      )}

    </div>
  );
}