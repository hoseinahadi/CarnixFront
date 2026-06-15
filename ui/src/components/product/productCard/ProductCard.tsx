// src/components/product/productCard/ProductCard.tsx

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/models/product/Product'; 
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();

  // ✅ اصلاح: استفاده از slug یا productId به جای productName
  const handleCardClick = () => {
    if (product.productName) {
      router.push(`/product/${product.productName}`);
    } else {
      router.push(`/product/${product.productId}`);
    }
  };

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const hasDiscount = product.productDiscount && product.productDiscount.isActive;
  let finalPrice = product.basePrice;
  let discountLabel = null;

  if (hasDiscount && product.productDiscount) {
    const { discountType, discountValue } = product.productDiscount;
    if (discountType) {
      finalPrice = product.basePrice - (product.basePrice * discountValue / 100);
      discountLabel = `${discountValue}%`;
    } else {
      finalPrice = product.basePrice - discountValue;
      if (finalPrice < 0) finalPrice = 0;
    }
  }

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.link}>
        <div className={styles.imageWrapper}>
          {hasDiscount && discountLabel && (
            <span className={styles.discountBadge}>{discountLabel}</span>
          )}
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.productName} 
              className={styles.productImage} 
            />
          ) : (
            <span className={styles.placeholder}>بدون تصویر</span>
          )}
        </div>
        <h3 className={styles.title}>{product.productName}</h3>
      </div>

      <div className={styles.footer}>
        <div className={styles.priceWrapper}>
          {hasDiscount && (
            <span className={styles.oldPrice}>{product.basePrice.toLocaleString()}</span>
          )}
          <span className={styles.priceValue}>
            {finalPrice.toLocaleString()} <span className={styles.currency}>تومان</span>
          </span>
        </div>
        <button className={styles.cartBtn} onClick={handleActionClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;