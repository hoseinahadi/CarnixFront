'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppSelector } from '@/store/hooks'; 
import { selectProductDetails, selectDetailsLoading } from '@/store/feature/product/productSelectors'; 
import { Heart, Scale, ImageIcon, Loader2 } from 'lucide-react';
import styles from './ProductGallery.module.scss';
import { wishlistApi } from '@/features/wishlist/api/wishlistApi';

// تابع کمکی برای ساخت آدرس صحیح عکس
const getValidImageUrl = (rawUrl?: string): string | null => {
  if (!rawUrl) return null;
  
  // حذف wwwroot از ابتدای مسیر
  let cleanPath = rawUrl.replace(/^wwwroot[\\/]/i, '');
  
  // مطمئن می‌شویم که با اسلش شروع می‌شود
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // آدرس پایه بک‌اند
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7191';
  
  return `${backendBaseUrl}${cleanPath}`;
};

// کامپوننت Fallback برای وقتی تصویر لود نمیشه
const ImageWithFallback = ({ src, alt, ...props }: any) => {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className={styles.noImageFallback}>
        <ImageIcon size={48} color="#64748b" />
        <p>تصویری موجود نیست</p>
      </div>
    );
  }
  
  return (
    <Image
      src={src}
      alt={alt || 'تصویر محصول'}
      onError={() => setError(true)}
      {...props}
    />
  );
};

export default function ProductGallery() {
  const product = useAppSelector(selectProductDetails);
  const isLoading = useAppSelector(selectDetailsLoading);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // بررسی وضعیت علاقه‌مندی
  useEffect(() => {
    if (!product?.productId) return;

    const token = localStorage.getItem('token'); 

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
  let images = product.images || [];
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

  const currentImageRaw = images[activeIndex]?.imageUrl;
  const currentImage = getValidImageUrl(currentImageRaw);

  const handleWishlistToggle = async () => {
    if (!product.productId || isWishlistLoading) return;

    const token = localStorage.getItem('token');

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
          {currentImage ? (
            <Image
              src={currentImage}
              alt={product.productName || 'تصویر محصول'}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className={styles.imageConfig}
              priority
              unoptimized={process.env.NODE_ENV === 'development'}
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
                    unoptimized={process.env.NODE_ENV === 'development'}
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