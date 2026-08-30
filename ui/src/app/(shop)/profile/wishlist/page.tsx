'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IconHeart, IconTrash, IconCar } from '@tabler/icons-react'

import styles from './WishlistPage.module.scss'
import { wishlistApi } from '@/features/wishlist/api/wishlistApi'
import BackToSidebar from '@/components/profile/BackToSidebar/BackToSidebar'
import { formatPrice } from '@/utils/price'

interface WishlistProduct {
  productId: number;
  name: string;
  basePrice: number;
  imageUrl?: string;
  vehicleModel?: string;
}

interface WishlistItem {
  userWishlistId?: number;
  productId: number;
  product?: WishlistProduct;
  name?: string;
  basePrice?: number;
  imageUrl?: string;
  vehicleModel?: string;
}

const extractWishlistItems = (response: unknown): WishlistItem[] => {
  const payload = (response as { data?: unknown })?.data;

  if (Array.isArray(payload)) return payload as WishlistItem[];
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;
  const directCandidates = [root.data, root.items];

  for (const candidate of directCandidates) {
    if (Array.isArray(candidate)) return candidate as WishlistItem[];

    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items as WishlistItem[];
      if (Array.isArray(nested.Items)) return nested.Items as WishlistItem[];
    }
  }

  return [];
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as {
      response?: { data?: { message?: string } };
    }).response;
    if (response?.data?.message) return response.data.message;
  }

  return 'ارتباط با سرور برقرار نشد یا خطا در دریافت اطلاعات رخ داد.';
};

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingIds, setRemovingIds] = useState<Set<number>>(() => new Set())

  useEffect(() => {
    let active = true;

    const loadWishlist = async () => {
      try {
        setIsLoading(true)
        setError('')
        const response = await wishlistApi.getMyWishlist()
        if (active) setItems(extractWishlistItems(response))
      } catch (err: unknown) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void loadWishlist()

    return () => {
      active = false
    }
  }, [])

  const handleRemoveItem = async (productId: number) => {
    if (removingIds.has(productId)) return

    const removedIndex = items.findIndex((item) => item.productId === productId)
    const removedItem = removedIndex >= 0 ? items[removedIndex] : undefined

    setError('')
    setRemovingIds((current) => new Set(current).add(productId))
    setItems((current) => current.filter((item) => item.productId !== productId))

    try {
      await wishlistApi.removeFromWishlist(productId)
    } catch (err: unknown) {
      // فقط همان آیتمی که حذفش شکست خورده برگردد؛ rollback یک حذف نباید
      // نتیجه حذف موفق هم‌زمانِ محصول دیگری را بازنویسی کند.
      if (removedItem) {
        setItems((current) => {
          if (current.some((item) => item.productId === productId)) return current

          const next = [...current]
          next.splice(Math.min(removedIndex, next.length), 0, removedItem)
          return next
        })
      }
      setError(getErrorMessage(err))
    } finally {
      setRemovingIds((current) => {
        const next = new Set(current)
        next.delete(productId)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BackToSidebar />
          <h2 className={styles.title}>محصولات مورد علاقه</h2>
        </div>
        <div className={styles.grid}>
          {[1, 2, 3, 4].map((skeleton) => (
            <div key={skeleton} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText} style={{ width: '90%' }}></div>
              <div className={styles.skeletonText} style={{ width: '60%', marginTop: '8px' }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <BackToSidebar />
          محصولات مورد علاقه
        </h2>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <IconHeart size={64} stroke={1} className={styles.emptyIcon} />
          <h3>لیست علاقه‌مندی‌ها خالی است</h3>
          <p>محصولات مورد علاقه خود را به این لیست اضافه کنید.</p>
          <button onClick={() => router.push('/products')} className={styles.shopButton}>
            رفتن به فروشگاه
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => {
            const product = item.product ?? item
            const productId = product.productId ?? item.productId
            const isRemoving = removingIds.has(productId)

            return (
              <div key={item.userWishlistId ?? `product-${productId}`} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name || 'محصول'}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.noImage}>بدون تصویر</div>
                  )}
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.productTitle} title={product.name}>
                    {product.name || 'بدون نام'}
                  </h3>

                  <div className={styles.carModelRow}>
                    <IconCar size={16} className={styles.carIcon} />
                    <span>{product.vehicleModel || 'عمومی'}</span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {formatPrice(product.basePrice)} <span>تومان</span>
                    </span>
                    <button
                      className={styles.removeBtn}
                      onClick={() => void handleRemoveItem(productId)}
                      aria-label="حذف از علاقه‌مندی‌ها"
                      disabled={isRemoving}
                    >
                      <IconTrash size={18} stroke={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
