'use client';

import { useState, useEffect } from 'react';
import { getMediaUrl } from '@/utils/media/getMediaUrl';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks'; 
import { selectProductDetails, selectDetailsLoading } from '@/store/feature/product/productSelectors'; 
import { Heart, Scale, ImageIcon, Loader2 } from 'lucide-react';
import styles from './ProductGallery.module.scss';
import { wishlistApi } from '@/features/wishlist/api/wishlistApi';
import { getAccessToken } from '@/services/api/common/authTokenStorage';
import type { Product } from '@/models/product/Product';
import type { ProductDetails } from '@/models/product/ProductDetails';

// تابع کمکی برای ساخت آدرس صحیح عکس
const getValidImageUrl = (rawUrl?: string) => getMediaUrl(rawUrl);

interface ProductGalleryProps {
  productOverride?: Product | ProductDetails;
}

export default function ProductGallery({ productOverride }: ProductGalleryProps = {}) {
  const selectedProduct = useAppSelector(selectProductDetails);
  const detailsLoading = useAppSelector(selectDetailsLoading);
  const product = productOverride ?? selectedProduct;
  const isLoading = productOverride ? false : detailsLoading;
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // بررسی وضعیت علاقه‌مندی
  useEffect(() => {
    if (!product?.productId) return;

    const token = getAccessToken();

    if (token) {
      if ('isFavorite' in product) {
        setIsFavorite(Boolean((product as any).isFavorite));
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      setIsFavorite(guestWishlist.includes(product.productId));
    }
  }, [product]);

  if (isLoading) {
    return <div className={styles.skeletonGallery}></div>;
  }

  if (!product) {
    return null;
  }

  // 🔥 تبدیل images به آرایه (اگر string باشه از SSR)
  let images = 'images' in product ? product.images || [] : [];
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch {
      images = [];
    }
  }
  
  if (!Array.isArray(images)) {
    images = [];
  }

  if (images.length === 0 && product.imageUrl) {
    images = [{
      imageId: 0,
      imageUrl: product.imageUrl,
      isMain: true,
      displayOrder: 0,
    }];
  }

  const currentImageRaw = images[activeIndex]?.imageUrl;
  const currentImage = getValidImageUrl(currentImageRaw);

  const handleWishlistToggle = async () => {
    if (!product.productId || isWishlistLoading) return;

    const token = getAccessToken();

    if (token) {
      setIsWishlistLoading(true);
      try {
        if (isFavorite) {
          await wishlistApi.removeFromWishlist(product.productId);
          setIsFavorite(false);
        } else {
          await wishlistApi.addToWishlist(product.productId);
          setIsFavorite(true);
        }
      } catch (error: any) {
        console.error('Wishlist API Error:', error);
      } finally {
        setIsWishlistLoading(false);
      }
    } 
    else {
      const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      
      if (isFavorite) {
        const updatedWishlist = guestWishlist.filter((id: number) => id !== product.productId);
        localStorage.setItem('guest_wishlist', JSON.stringify(updatedWishlist));
        setIsFavorite(false);
      } else {
        if (!guestWishlist.includes(product.productId)) {
          guestWishlist.push(product.productId);
          localStorage.setItem('guest_wishlist', JSON.stringify(guestWishlist));
        }
        setIsFavorite(true);
      }
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        {/* دکمه‌های عملیات */}
        <div className={styles.actionIcons}>
          <button 
            className={styles.iconBtn} 
            aria-label="افزودن به علاقه‌مندی‌ها"
            onClick={handleWishlistToggle}
            disabled={isWishlistLoading}
          >
            {isWishlistLoading ? (
              <Loader2 size={20} className={styles.spinner} color="white" />
            ) : (
              <Heart 
                size={20} 
                strokeWidth={1.5} 
                color={isFavorite ? "#ef4444" : "white"} 
                fill={isFavorite ? "#ef4444" : "transparent"} 
              />
            )}
          </button>
          
          <div className={styles.iconDivider}></div>
          
          <button className={styles.iconBtn} aria-label="مقایسه">
            <Scale size={20} strokeWidth={1.5} color="white" />
          </button>
        </div>

        {/* تصویر اصلی */}
        <div className={styles.mainImage}>
          {currentImage && !imageErrors[activeIndex] ? (
            <Image
              src={currentImage}
              alt={product.productName || 'تصویر محصول'}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className={styles.imageConfig}
              priority
              onError={() => {
                setImageErrors(prev => ({ ...prev, [activeIndex]: true }));
              }}
            />
          ) : (
            <div className={styles.noImageFallback}>
              <ImageIcon size={48} color="#64748b" />
              <p>تصویری موجود نیست</p>
            </div>
          )}
        </div>
      </div>

      {/* تصاویر بندانگشتی */}
      {images.length > 1 && (
        <div className={styles.thumbnailList}>
          {images.map((img: any, index: number) => {
            const thumbUrl = getValidImageUrl(img.imageUrl);
            
            return (
              <button
                key={img.imageId || index}
                className={`${styles.thumbnailItem} ${
                   activeIndex === index ? styles.activeThumbnail : ''
                }`}
                onClick={() => setActiveIndex(index)}
              >
                {thumbUrl ? (
                  <Image
                    src={thumbUrl}
                    alt={`${product.productName} - تصویر ${index + 1}`}
                    fill
                    sizes="80px"
                    className={styles.imageConfig}
                  />
                ) : (
                  <ImageIcon size={24} color="#ccc" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
