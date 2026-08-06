// src/app/profile/wishlist/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './WishlistPage.module.scss'
import { IconHeart, IconTrash, IconCar } from '@tabler/icons-react'
import { wishlistApi } from '@/features/wishlist/api/wishlistApi'
import BackToSidebar from '@/components/profile/BackToSidebar/BackToSidebar'

interface WishlistProduct {
  productId: number;
  name: string;
  basePrice: number;
  imageUrl?: string;
  vehicleModel?: string;
}

interface WishlistItem {
  userWishlistId: number;
  productId: number;
  product: WishlistProduct;
}

export default function WishlistPage() {
  const router = useRouter()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setIsLoading(true)
      setError('')
      const response = await wishlistApi.getMyWishlist()
      
      // 🔍 لاگ‌های عیب‌یابی دقیق برای بررسی ساختار پاسخ
      console.log('📦 [Wishlist Debug] Full Axios Response Object:', response)
      console.log('📦 [Wishlist Debug] response.data:', response?.data)

      const responseData = response?.data

      let rawList: any = []

      // حالت‌های مختلف ساختار پاسخ در دات‌نت و پکیجینگ‌های مختلف
      if (Array.isArray(responseData)) {
        rawList = responseData
      } else if (Array.isArray(responseData?.data)) {
        rawList = responseData.data
      } else if (Array.isArray(responseData?.data?.items)) {
        rawList = responseData.data.items
      } else if (Array.isArray(responseData?.data?.Items)) {
        rawList = responseData.data.Items
      } else if (Array.isArray(responseData?.items)) {
        rawList = responseData.items
      }

      console.log('🎯 [Wishlist Debug] Extracted Array Items:', rawList)
      setItems(rawList)

    } catch (err: any) {
      console.error('❌ [Wishlist Debug] Catch Error:', err)
      setError(err?.response?.data?.message || 'ارتباط با سرور برقرار نشد یا خطا در دریافت اطلاعات رخ داد.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (productId: number) => {
    try {
      setItems(prev => prev.filter(item => item.productId !== productId))
      await wishlistApi.removeFromWishlist(productId)
    } catch (err) {
      console.error('❌ [Wishlist] Error removing item:', err)
      fetchWishlist()
    }
  }

  const formatPrice = (price: number) => {
    if (!price) return '۰'
    return new Intl.NumberFormat('fa-IR').format(price)
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
          {items.map((item, index) => {
            const product = item?.product || item; // پشتیبانی از حالت مپ‌نشده یا مپ‌شده

            return (
              <div key={item.userWishlistId || index} className={styles.productCard}>
                <div className={styles.imageWrapper}>
                  {product?.imageUrl ? (
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
                  <h3 className={styles.productTitle} title={product?.name}>
                    {product?.name || 'بدون نام'}
                  </h3>
                  
                  <div className={styles.carModelRow}>
                    <IconCar size={16} className={styles.carIcon} />
                    <span>{product?.vehicleModel || 'عمومی'}</span>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>
                      {formatPrice(product?.basePrice)} <span>تومان</span>
                    </span>
                    <button 
                      className={styles.removeBtn} 
                      onClick={() => handleRemoveItem(product?.productId || item.productId)}
                      aria-label="حذف از علاقه‌مندی‌ها"
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