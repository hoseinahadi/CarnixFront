// src/components/product/productCard/ProductCard.tsx

import React, { useEffect, useState } from 'react';
import { getMediaUrl } from '@/utils/media/getMediaUrl';
import OptimizedImage from '@/components/common/OptimizedImage/OptimizedImage';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/models/product/Product'; 
import { useAppDispatch, useAppSelector } from '@/store/hooks'; 
import { addToCart, updateItemQuantity, removeCartItem } from '@/store/feature/cart/cartThunks'; 
import { selectCart, selectCartActionLoading } from '@/store/feature/cart/cartSelectors'; 
import { Plus, Minus, Trash2, Loader2, ShoppingCart, Heart } from 'lucide-react';
import styles from './ProductCard.module.scss';
import ProductOverViewModal from '../ProductOverViewModal/ProductOverViewModal';
import { roundPrice } from '@/utils/price';
import toast from 'react-hot-toast'; // 🟢 اضافه شدن Toast
import { wishlistApi } from '@/features/wishlist/api/wishlistApi';
import { getAccessToken } from '@/services/api/common/authTokenStorage';

interface ProductCardProps {
  product: Product;
}

const formatPrice = (price: number): number => roundPrice(price);

const getValidImageUrl = (rawUrl?: string) => getMediaUrl(rawUrl);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentImage = getValidImageUrl(product.imageUrl);
  
  const cart = useAppSelector(selectCart);
  const isGlobalCartLoading = useAppSelector(selectCartActionLoading);
  const [isAddingThisItem, setIsAddingThisItem] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(Boolean((product as Product & { isFavorite?: boolean }).isFavorite));
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  useEffect(() => {
    const backendFavorite = (product as Product & { isFavorite?: boolean }).isFavorite;
    if (typeof backendFavorite === 'boolean') {
      setIsFavorite(backendFavorite);
      return;
    }

    if (!getAccessToken()) {
      const guestWishlist: number[] = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      setIsFavorite(guestWishlist.includes(product.productId));
    }
  }, [product]);

  const cartItem = cart?.items?.find((item: any) => item.productId === product.productId);
  const isInCart = !!cartItem;
  const isOutOfStock = product.totalStock <= 0;

  const handleCardClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // ناموجودها هم باید صفحه‌ی کامل محصول را باز کنند تا کاربر بتواند
    // مشخصات و زمان تأمین را ببیند. مشاهده سریع فقط برای کالای موجود در
    // چیدمان موبایل استفاده می‌شود.
    if (!isOutOfStock && window.innerWidth <= 768) {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlistLoading) return;

    const previousValue = isFavorite;
    setIsFavorite(!previousValue);
    setIsWishlistLoading(true);

    try {
      if (getAccessToken()) {
        if (previousValue) await wishlistApi.removeFromWishlist(product.productId);
        else await wishlistApi.addToWishlist(product.productId);
      } else {
        const guestWishlist: number[] = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
        const nextWishlist = previousValue
          ? guestWishlist.filter((id) => id !== product.productId)
          : Array.from(new Set([...guestWishlist, product.productId]));
        localStorage.setItem('guest_wishlist', JSON.stringify(nextWishlist));
      }
      toast.success(previousValue ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد');
    } catch {
      setIsFavorite(previousValue);
      toast.error('تغییر علاقه‌مندی انجام نشد');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      router.push(`/product/${product.productId}`);
      return;
    }
    if (isGlobalCartLoading) return;

    setIsAddingThisItem(true);
    try {
      await dispatch(addToCart({ productId: product.productId, quantity: 1 })).unwrap();
      toast.success('محصول با موفقیت به سبد خرید اضافه شد', { duration: 3000 }); // 🟢 پیام موفقیت
    } catch (error) {
      toast.error(error as string, { duration: 4000 }); // 🟢 نمایش ارور به صورت پاپ‌آپ موقت
    } finally {
      setIsAddingThisItem(false);
    }
  };

  const handleIncrease = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && !isGlobalCartLoading) {
      try {
        await dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity + 1 })).unwrap();
      } catch (error) {
        toast.error(error as string, { duration: 4000 }); // 🟢
      }
    }
  };

  const handleDecreaseOrRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem && !isGlobalCartLoading) {
      try {
        if (cartItem.quantity > 1) {
          await dispatch(updateItemQuantity({ cartItemId: cartItem.cartItemId, quantity: cartItem.quantity - 1 })).unwrap();
        } else {
          await dispatch(removeCartItem(cartItem.cartItemId)).unwrap();
          toast.success('محصول از سبد خرید حذف شد', { duration: 3000 });
        }
      } catch (error) {
        toast.error(error as string, { duration: 4000 }); // 🟢
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

  return (
    <>
      <Link
        className={styles.card}
        href={`/product/${product.productId}`}
        onClick={handleCardClick}
        dir="rtl"
      >
        <div className={styles.link}>
          <div className={styles.imageWrapper}>
            <button
              type="button"
              className={styles.quickViewBtn}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              مشاهده سریع
            </button>
            <button
              type="button"
              className={`${styles.favoriteBtn} ${isFavorite ? styles.favoriteActive : ''}`}
              aria-label={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              aria-pressed={isFavorite}
              disabled={isWishlistLoading}
              onClick={handleWishlistToggle}
            >
              {isWishlistLoading
                ? <Loader2 size={19} className={styles.spinnerIcon} />
                : <Heart size={19} fill={isFavorite ? 'currentColor' : 'none'} />}
            </button>
            {hasDiscount && discountLabel && !isOutOfStock && (
              <span className={styles.discountBadge}>{discountLabel}</span>
            )}
            
            {currentImage && failedImage !== currentImage ? (
              <OptimizedImage 
                src={currentImage} 
                alt={product.productName} 
                className={`${styles.productImage} ${isOutOfStock ? styles.grayscale : ''}`} 
                draggable={false} 
                width={480}
                height={480}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 220px"
                onError={() => setFailedImage(currentImage)}
              />
            ) : (
              <span className={styles.placeholder}>بدون تصویر</span>
            )}
            
            {isOutOfStock && (
              <span className={styles.outOfStockBadge}>ناموجود</span>
            )}
          </div>
          
          <h3 className={styles.title} title={product.productName}>
            {product.productName}
          </h3>
        </div>

        <div className={styles.footer}>
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

          <div className={styles.cartActionWrapper}>
            {!isInCart ? (
              <button 
                className={`${styles.cartBtn} ${isOutOfStock ? styles.disabledBtn : ''}`} 
                onClick={handleAddToCart}
                disabled={isAddingThisItem}
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
      </Link>

      <ProductOverViewModal 
        isOpen={isModalOpen} 
        modalClose={() => setIsModalOpen(false)} 
        product={product} 
      />
    </>
  );
};

export default ProductCard;
