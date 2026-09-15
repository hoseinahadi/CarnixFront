'use client';

import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, ImageIcon, Loader2, Maximize2, Scale, X } from 'lucide-react';

import { wishlistApi } from '@/features/wishlist/api/wishlistApi';
import type { Product } from '@/models/product/Product';
import type { ProductDetails } from '@/models/product/ProductDetails';
import { getAccessToken } from '@/services/api/common/authTokenStorage';
import { useAppSelector } from '@/store/hooks';
import { selectDetailsLoading, selectProductDetails } from '@/store/feature/product/productSelectors';
import { getMediaUrl } from '@/utils/media/getMediaUrl';

import styles from './ProductGallery.module.scss';

interface ProductGalleryProps {
  productOverride?: Product | ProductDetails;
}

interface GalleryImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
}

const readString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const readNumber = (record: Record<string, unknown>, keys: string[], fallback: number) => {
  for (const key of keys) {
    const value = Number(record[key]);
    if (Number.isFinite(value)) return value;
  }
  return fallback;
};

function normalizeGalleryImages(product?: Product | ProductDetails | null): GalleryImage[] {
  if (!product) return [];

  let rawImages: unknown = 'images' in product ? product.images : [];
  if (typeof rawImages === 'string') {
    try {
      rawImages = JSON.parse(rawImages);
    } catch {
      rawImages = [];
    }
  }

  const candidates = Array.isArray(rawImages) ? rawImages : [];
  const normalized = candidates.flatMap((value, index): GalleryImage[] => {
    if (typeof value === 'string') {
      return value.trim()
        ? [{ id: `url-${value}`, imageUrl: value.trim(), displayOrder: index, isPrimary: index === 0 }]
        : [];
    }
    if (!value || typeof value !== 'object') return [];

    const record = value as Record<string, unknown>;
    const imageUrl = readString(record, ['imageUrl', 'ImageUrl', 'mediaUrl', 'MediaUrl', 'url', 'Url']);
    if (!imageUrl) return [];

    const imageId = readNumber(record, ['imageId', 'ImageId', 'productImageId', 'ProductImageId', 'id'], index);
    return [{
      id: `${imageId}-${imageUrl}`,
      imageUrl,
      displayOrder: readNumber(record, ['displayOrder', 'DisplayOrder', 'sortOrder'], index),
      isPrimary: Boolean(record.isPrimary ?? record.IsPrimary ?? record.isMain ?? record.IsMain),
    }];
  });

  if (normalized.length === 0 && product.imageUrl?.trim()) {
    normalized.push({
      id: `product-${product.productId}`,
      imageUrl: product.imageUrl.trim(),
      displayOrder: 0,
      isPrimary: true,
    });
  }

  const unique = Array.from(new Map(normalized.map((image) => [image.imageUrl, image])).values());
  return unique.sort((left, right) => {
    if (left.isPrimary !== right.isPrimary) return left.isPrimary ? -1 : 1;
    return left.displayOrder - right.displayOrder;
  });
}

export default function ProductGallery({ productOverride }: ProductGalleryProps = {}) {
  const selectedProduct = useAppSelector(selectProductDetails);
  const detailsLoading = useAppSelector(selectDetailsLoading);
  const product = productOverride ?? selectedProduct;
  const isLoading = productOverride ? false : detailsLoading;

  const images = useMemo(() => normalizeGalleryImages(product), [product]);
  const imageSignature = images.map((image) => image.imageUrl).join('|');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveIndex(0);
    setImageErrors({});
    setIsLightboxOpen(false);
  }, [product?.productId, imageSignature]);

  useEffect(() => {
    if (!product?.productId) return;
    const token = getAccessToken();
    if (token && 'isFavorite' in product) {
      setIsFavorite(Boolean((product as Product & { isFavorite?: boolean }).isFavorite));
      return;
    }
    if (!token) {
      const guestWishlist = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
      setIsFavorite(guestWishlist.includes(product.productId));
    }
  }, [product]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsLightboxOpen(false);
      if (event.key === 'ArrowLeft' && images.length > 1) setActiveIndex((index) => (index + 1) % images.length);
      if (event.key === 'ArrowRight' && images.length > 1) setActiveIndex((index) => (index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [images.length, isLightboxOpen]);

  const moveImage = (direction: 1 | -1) => {
    if (images.length < 2) return;
    setActiveIndex((index) => (index + direction + images.length) % images.length);
  };

  const handleWishlistToggle = async () => {
    if (!product?.productId || isWishlistLoading) return;
    const token = getAccessToken();

    if (token) {
      setIsWishlistLoading(true);
      try {
        if (isFavorite) await wishlistApi.removeFromWishlist(product.productId);
        else await wishlistApi.addToWishlist(product.productId);
        setIsFavorite((value) => !value);
      } catch (error: unknown) {
        console.error('Wishlist API Error:', error);
      } finally {
        setIsWishlistLoading(false);
      }
      return;
    }

    const guestWishlist: number[] = JSON.parse(localStorage.getItem('guest_wishlist') || '[]');
    const nextWishlist = isFavorite
      ? guestWishlist.filter((id) => id !== product.productId)
      : Array.from(new Set([...guestWishlist, product.productId]));
    localStorage.setItem('guest_wishlist', JSON.stringify(nextWishlist));
    setIsFavorite((value) => !value);
  };

  if (isLoading) return <div className={styles.skeletonGallery} />;
  if (!product) return null;

  const activeImage = images[activeIndex] ?? images[0];
  const currentImage = getMediaUrl(activeImage?.imageUrl);
  const hasCurrentImage = Boolean(currentImage && activeImage && !imageErrors[activeImage.imageUrl]);

  const imageView = (lightbox = false) => hasCurrentImage ? (
    <Image
      key={activeImage.imageUrl}
      src={currentImage!}
      alt={`${product.productName || 'تصویر محصول'} - تصویر ${activeIndex + 1}`}
      fill
      sizes={lightbox ? '100vw' : '(max-width: 768px) 100vw, 520px'}
      className={styles.imageConfig}
      priority={!lightbox}
      onError={() => setImageErrors((previous) => ({ ...previous, [activeImage.imageUrl]: true }))}
    />
  ) : (
    <div className={styles.noImageFallback}>
      <ImageIcon size={48} />
      <p>تصویری موجود نیست</p>
    </div>
  );

  const lightbox = isLightboxOpen && typeof document !== 'undefined'
    ? createPortal(
      <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="نمایش بزرگ تصویر محصول" onClick={() => setIsLightboxOpen(false)}>
        <button type="button" className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)} aria-label="بستن تصویر"><X size={26} /></button>
        <div className={styles.lightboxStage} onClick={(event) => event.stopPropagation()}>
          <div className={styles.lightboxImage}>{imageView(true)}</div>
          {images.length > 1 && (
            <>
              <button type="button" className={`${styles.lightboxNav} ${styles.lightboxPrevious}`} onClick={() => moveImage(-1)} aria-label="تصویر قبلی"><ChevronRight size={30} /></button>
              <button type="button" className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={() => moveImage(1)} aria-label="تصویر بعدی"><ChevronLeft size={30} /></button>
            </>
          )}
          <span className={styles.lightboxCounter}>{activeIndex + 1} / {images.length}</span>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.mainImageWrapper}>
        <div className={styles.actionIcons}>
          <button type="button" className={styles.iconBtn} aria-label="افزودن به علاقه‌مندی‌ها" onClick={handleWishlistToggle} disabled={isWishlistLoading}>
            {isWishlistLoading
              ? <Loader2 size={20} className={styles.spinner} />
              : <Heart size={20} strokeWidth={1.5} fill={isFavorite ? 'currentColor' : 'transparent'} className={isFavorite ? styles.favoriteIcon : undefined} />}
          </button>
          <div className={styles.iconDivider} />
          <button type="button" className={styles.iconBtn} aria-label="مقایسه"><Scale size={20} strokeWidth={1.5} /></button>
          <div className={styles.iconDivider} />
          <button type="button" className={styles.iconBtn} aria-label="نمایش تمام صفحه" onClick={() => hasCurrentImage && setIsLightboxOpen(true)} disabled={!hasCurrentImage}><Maximize2 size={20} strokeWidth={1.5} /></button>
        </div>

        <button type="button" className={styles.mainImage} onClick={() => hasCurrentImage && setIsLightboxOpen(true)} aria-label="نمایش بزرگ تصویر محصول">
          {imageView()}
        </button>

        {images.length > 1 && (
          <>
            <button type="button" className={`${styles.galleryNav} ${styles.galleryPrevious}`} onClick={() => moveImage(-1)} aria-label="تصویر قبلی"><ChevronRight size={24} /></button>
            <button type="button" className={`${styles.galleryNav} ${styles.galleryNext}`} onClick={() => moveImage(1)} aria-label="تصویر بعدی"><ChevronLeft size={24} /></button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className={styles.thumbnailList} role="list" aria-label="تصاویر محصول">
          {images.map((image, index) => {
            const thumbnailUrl = getMediaUrl(image.imageUrl);
            const failed = imageErrors[image.imageUrl];
            return (
              <button
                type="button"
                key={image.id}
                className={`${styles.thumbnailItem} ${activeIndex === index ? styles.activeThumbnail : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`نمایش تصویر ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
              >
                {thumbnailUrl && !failed ? (
                  <Image src={thumbnailUrl} alt="" fill sizes="80px" className={styles.imageConfig} onError={() => setImageErrors((previous) => ({ ...previous, [image.imageUrl]: true }))} />
                ) : <ImageIcon size={24} />}
              </button>
            );
          })}
        </div>
      )}
      {lightbox}
    </div>
  );
}
