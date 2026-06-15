  // src/components/product/ProductInfo/ProductInfo.tsx
  'use client';

  import React, { useState, useEffect } from 'react';
  import { useAppSelector } from '@/store/hooks'; 
  import { selectProductDetails, selectDetailsLoading } from '@/store/feature/product/productSelectors'; 
  import styles from './ProductInfo.module.scss';

  // تابع کمکی برای تبدیل نام رنگ‌های رایج خودرویی به کد رنگ (HEX)
  const getCarColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      'مشکی': '#000000',
      'سفید': '#ffffff',
      'سفید دو پوششه': '#f8f9fa',
      'نقره ای': '#c0c0c0',
      'نقره ای متالیک': '#e0e0e0',
      'نوک مدادی': '#4a4a4a',
      'خاکستری': '#808080',
      'قرمز': '#ff0000',
      'آبی کبود': '#1a237e',
      'آبی کاسپین': '#0277bd',
      'بژ': '#d1bfae',
    };
    return colors[colorName] || '#ccc'; // رنگ پیش‌فرض اگر پیدا نشد
  };

  export default function ProductInfo() {
    const product = useAppSelector(selectProductDetails);
    const isLoading = useAppSelector(selectDetailsLoading);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // استخراج مقادیر یکتا برای رنگ و سایز از لیست SKU ها
    const availableColors = Array.from(new Set(product?.skus?.map(sku => sku.colorName).filter(Boolean))) as string[];
    const availableSizes = Array.from(new Set(product?.skus?.map(sku => sku.sizeName).filter(Boolean))) as string[];

    useEffect(() => {
      if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
      if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
    }, [availableColors, availableSizes, selectedColor, selectedSize]);

    if (isLoading) {
      return (
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonBreadcrumb}></div>
          <div className={styles.skeletonTitle}></div>
          <div className={styles.skeletonCode}></div>
          <div className={styles.skeletonDivider}></div>
          <div className={styles.skeletonDesc}></div>
        </div>
      );
    }

    if (!product) return null;

    return (
      <div className={styles.productInfo}>
        {/* هدر: دسته‌بندی و عنوان */}
        <div className={styles.header}>
          <div className={styles.breadcrumbLinks}>
            <span className={styles.link}>{product.categoryName}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.link}>{product.brandName}</span>
          </div>
          
          <h1 className={styles.title}>{product.productName}</h1>
          
          {/* شماره فنی قطعه / کد محصول */}
          <div className={styles.metaInfo}>
            {product.productCode && (
              <span className={styles.productCode}>
                شماره فنی (کد قطعه): <span className={styles.codeValue}>{product.productCode}</span>
              </span>
            )}
          </div>
        </div>

        <hr className={styles.divider} />

        {/* بخش انتخاب رنگ بدنه / قطعه */}
        {availableColors.length > 0 && (
          <div className={styles.variantSection}>
            <h3 className={styles.variantTitle}>
              رنگ قطعه: <span className={styles.selectedValue}>{selectedColor}</span>
            </h3>
            <div className={styles.colorOptions}>
              {availableColors.map((color, index) => {
                const isActive = selectedColor === color;
                return (
                  <button
                    key={index}
                    className={`${styles.colorBtn} ${isActive ? styles.active : ''}`}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    aria-label={`انتخاب رنگ ${color}`}
                  >
                    <span 
                      className={styles.colorCircle} 
                      style={{ backgroundColor: getCarColorHex(color) }}
                    >
                      {isActive && (
                        <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* بخش انتخاب سایز / سمت (مثلا چپ/راست یا مدل دقیق ماشین) */}
        {availableSizes.length > 0 && (
          <>
            {availableColors.length > 0 && <hr className={styles.dividerLight} />}
            <div className={styles.variantSection}>
              <h3 className={styles.variantTitle}>
                مدل / سمت: <span className={styles.selectedValue}>{selectedSize}</span>
              </h3>
              <div className={styles.sizeOptions}>
                {availableSizes.map((size, index) => (
                  <button
                    key={index}
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ویژگی‌های محصول / خلاصه توضیحات */}
        {product.shortDescription && (
          <>
            <hr className={styles.divider} />
            <div className={styles.description}>
              <h3 className={styles.descTitle}>ویژگی‌های قطعه</h3>
              <div className={styles.descContent}>
                {/* اگر خلاصه توضیحات با خط تیره یا enter جدا شده باشد، می‌توان لیست کرد. در غیر این صورت متن ساده است */}
                <p>{product.shortDescription}</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
