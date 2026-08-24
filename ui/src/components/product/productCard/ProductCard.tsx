// src/components/product/productCard/ProductCard.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/models/product/Product'; 
import { useAppDispatch, useAppSelector } from '@/store/hooks'; 
import { addToCart, updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks'; 
import { selectCart, selectCartActionLoading } from '@/store/feature/cart/cartSelectors'; 
import { Plus, Minus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import styles from './ProductCard.module.scss';
import ProductOverViewModal from '../ProductOverViewModal/ProductOverViewModal'; 

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number): number => {
  if (!price || isNaN(price)) return 0;
  return price;
};

const getValidImageUrl = (rawUrl?: string) => {
  if (process.env.NODE_ENV === 'development') {
    return 'https://localhost:7191/uploads/products/111.png'; 
  }
  if (!rawUrl) return null;
  let cleanPath = rawUrl.replace(/^wwwroot[\\/]/i, '');
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7191';
  return `${backendBaseUrl}${cleanPath}`;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const cart = useAppSelector(selectCart);
  const isGlobalCartLoading = useAppSelector(selectCartActionLoading);
  const [isAddingThisItem, setIsAddingThisItem] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cartItem = cart?.items?.find((item: any) => item.productId === product.productId);
  const isInCart = !!cartItem;

  const handleCardClick = () => {
    if (window.innerWidth <= 768) {
      setIsModalOpen(true);
    } else {
      router.push(`/product/${product.productId}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.totalStock <= 0 || isGlobalCartLoading) return;

    setIsAddingThisItem(true);
    await dispatch(addToCart({ productId: product.productId, quantity: 1 }));
    setIsAddingThisItem(false);
  };

  const handleIncrease = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && !isGlobalCartLoading) {
      dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecreaseOrRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && !isGlobalCartLoading) {
      if (cartItem.quantity > 1) {
        dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity - 1 }));
      } else {
        dispatch(removeCartItem(cartItem.cartItemId));
      }
    }
  };

  const basePriceFormatted = formatPrice(product.basePrice);
  const hasDiscount = product.productDiscount && product.productDiscount.isActive;
  let finalPriceFormatted = basePriceFormatted;
  let discountLabel = null;

  if (hasDiscount && product.productDiscount) {
    const { discountType, discountValue } = product.productDiscount;
    if (discountType) {
      const calculatedFinalPrice = product.basePrice - (product.basePrice * discountValue / 100);
      finalPriceFormatted = formatPrice(calculatedFinalPrice);
      discountLabel = `${discountValue.toLocaleString('fa-IR')}٪`;
    } else {
      const calculatedFinalPrice = product.basePrice - discountValue;
      finalPriceFormatted = formatPrice(calculatedFinalPrice > 0 ? calculatedFinalPrice : 0);
    }
  }

  const isOutOfStock = product.totalStock <= 0;
  const currentImage = getValidImageUrl(product.imageUrl);

  return (
    <>
      <div className={styles.card} onClick={handleCardClick} dir="rtl">
        <div className={styles.link}>
          <div className={styles.imageWrapper}>
            {hasDiscount && discountLabel && !isOutOfStock && (
              <span className={styles.discountBadge}>{discountLabel}</span>
            )}
            
            {currentImage ? (
              <img 
                src={currentImage} 
                alt={product.productName} 
                className={`${styles.productImage} ${isOutOfStock ? styles.grayscale : ''}`} 
                draggable={false} 
              />
            ) : (
              <span className={styles.placeholder}>بدون تصویر</span>
            )}
            
            {/* بج ناموجود روی عکس */}
            {isOutOfStock && (
              <span className={styles.outOfStockBadge}>ناموجود</span>
            )}
          </div>
          
          <h3 className={styles.title} title={product.productName}>
            {product.productName}
          </h3>
        </div>

        <div className={styles.footer}>
          {/* 🟢 ۱. قیمت در سمت راست */}
          <div className={styles.priceWrapper}>
            {!isOutOfStock && hasDiscount && (
              <span className={styles.oldPrice}>{basePriceFormatted.toLocaleString('fa-IR')}</span>
            )}
            <span className={styles.priceValue}>
               {isOutOfStock ? (
                 <span className={styles.outOfStockText}>ناموجود</span>
               ) : (
                 <>
                   {finalPriceFormatted.toLocaleString('fa-IR')} <span className={styles.currency}>تومان</span>
                 </>
               )}
            </span>
          </div>

          {/* 🟢 ۲. دکمه سبد خرید در سمت چپ */}
          <div className={styles.cartActionWrapper}>
            {!isInCart ? (
              <button 
                className={`${styles.cartBtn} ${isOutOfStock ? styles.disabledBtn : ''}`} 
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingThisItem}
              >
                {isAddingThisItem ? (
                  <Loader2 className={styles.spinnerIcon} size={18} />
                ) : (
                  <ShoppingCart size={18} strokeWidth={2.5} />
                )}
              </button>
            ) : (
              <div className={styles.cartControls} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <button onClick={handleIncrease} disabled={isGlobalCartLoading} className={styles.controlBtn}>
                  <Plus size={14} strokeWidth={3} />
                </button>
                <span className={styles.quantityNumber}>
                  {isGlobalCartLoading ? <Loader2 className={styles.spinnerIconSmall} size={14} /> : cartItem.quantity.toLocaleString('fa-IR')}
                </span>
                <button onClick={handleDecreaseOrRemove} disabled={isGlobalCartLoading} className={`${styles.controlBtn} ${cartItem.quantity === 1 ? styles.danger : ''}`}>
                  {cartItem.quantity > 1 ? <Minus size={14} strokeWidth={3} /> : <Trash2 size={14} strokeWidth={2.5} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductOverViewModal 
        isOpen={isModalOpen} 
        modalClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </>
  );
};

export default ProductCard;