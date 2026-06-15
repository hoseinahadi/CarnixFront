'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectRelatedProducts, selectRelatedLoading } from '@/store/feature/product/productDetailSelectors'
import styles from './RelatedProducts.module.scss'
import { IconShoppingCart, IconPackage, IconReplace, IconHeart } from '@tabler/icons-react'
import Image from 'next/image'

// تایپ محصول مرتبط با اطلاعات کامل
interface RelatedProductInfo {
  productId: number
  name: string
  price: number
  imageUrl?: string
  relationshipType: string
  slug?: string
}

const RELATED_TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  Accessory: { label: 'لوازم جانبی', icon: <IconPackage size={12} /> },
  Alternative: { label: 'جایگزین', icon: <IconReplace size={12} /> },
  FrequentlyBoughtTogether: { label: 'اغلب با هم خریداری می‌شوند', icon: <IconHeart size={12} /> },
  Related: { label: 'مرتبط', icon: <IconShoppingCart size={12} /> },
}

const RelatedProducts = () => {
  const router = useRouter()
  const relatedData = useAppSelector(selectRelatedProducts)
  const loading = useAppSelector(selectRelatedLoading)

  const [products, setProducts] = useState<RelatedProductInfo[]>([])
  const [fetchingProducts, setFetchingProducts] = useState(false)

  // وقتی relatedData تغییر کرد، اطلاعات کامل محصولات رو fetch کن
  useEffect(() => {
    if (!relatedData?.all || relatedData.all.length === 0) return

    const fetchProductDetails = async () => {
      setFetchingProducts(true)
      try {
        const { default: axiosInstance } = await import('@/services/api/common/axiosInstance')
        
        const productPromises = relatedData.all.map(async (item: any) => {
          try {
            const response = await axiosInstance.get(`/Product/${item.relatedProductId}`)
            if (response.data?.isSuccess) {
              const product = response.data.data
              return {
                productId: product.productId || item.relatedProductId,
                name: product.name || product.productName || `محصول #${item.relatedProductId}`,
                price: product.basePrice || 0,
                imageUrl: product.imageUrl || product.images?.[0]?.imageUrl,
                relationshipType: item.relationshipType,
                slug: product.slug || product.name || `product-${item.relatedProductId}`,
              }
            }
          } catch (err) {
            console.error(`Failed to fetch product ${item.relatedProductId}`, err)
          }
          return {
            productId: item.relatedProductId,
            name: `محصول #${item.relatedProductId}`,
            price: 0,
            relationshipType: item.relationshipType,
          }
        })

        const results = await Promise.all(productPromises)
        setProducts(results.filter(p => p !== null))
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setFetchingProducts(false)
      }
    }

    fetchProductDetails()
  }, [relatedData])

  const formatPrice = (price: number) => {
    if (price === 0) return ''
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
  }
// اول useEffect اضافه کن:
useEffect(() => {
  console.log('🔍 relatedData:', relatedData);
  console.log('🔍 relatedData.all:', relatedData?.all);
  console.log('🔍 relatedData.all length:', relatedData?.all?.length);
}, [relatedData]);
  if (loading || fetchingProducts) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>محصولات مرتبط</h3>
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage}></div>
              <div className={styles.skeletonText}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>محصولات مرتبط</h3>

      <div className={styles.productsGrid}>
        {products.map((product) => (
          <div
            key={product.productId}
            className={styles.productCard}
            onClick={() => router.push(`/product/${product.productId}`)}
          >
            {/* تصویر محصول */}
            <div className={styles.productImage}>
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={120}
                  height={120}
                  className={styles.image}
                />
              ) : (
                <IconShoppingCart size={40} stroke={1} />
              )}
            </div>

            {/* اطلاعات محصول */}
            <div className={styles.productInfo}>
              <span className={styles.productName}>
                {product.name.length > 40
                  ? product.name.substring(0, 40) + '...'
                  : product.name}
              </span>
              
              {product.price > 0 && (
                <span className={styles.productPrice}>
                  {formatPrice(product.price)}
                </span>
              )}

              <span className={styles.relationType}>
                {RELATED_TYPE_LABELS[product.relationshipType]?.icon}
                {RELATED_TYPE_LABELS[product.relationshipType]?.label || product.relationshipType}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts