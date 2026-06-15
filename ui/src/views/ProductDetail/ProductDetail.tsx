'use client'

import { useEffect, use } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { getProductBySlug } from '@/store/feature/product/productThunks'
import { selectProductDetails, selectDetailsLoading } from '@/store/feature/product/productSelectors'
import { fetchProductReviews } from '@/store/feature/product/productReviewThunks'
import { fetchProductQuestions } from '@/store/feature/product/productQuestionThunks'
import { fetchRelatedProducts } from '@/store/feature/product/productRelatedThunks'
import { clearProductDetail } from '@/store/feature/product/productDetailSlice'

import styles from './ProductDetail.module.scss'
import ProductGallery from '@/components/product/ProductGallery/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo/ProductInfo'
import BuyBox from '@/components/product/BuyBox/BuyBox'
import ProductTabs from '@/components/product/ProductTabs/ProductTabs'
import ProductSpecifications from '@/components/product/ProductSpecifications/ProductSpecifications'
import ProductReviews from '@/components/product/ProductReviews/ProductReviews'
import ProductQuestions from '@/components/product/ProductQuestions/ProductQuestions'
import RelatedProducts from '@/components/product/RelatedProducts/RelatedProducts'


interface PageProps {
  params: Promise<{ slug: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const dispatch = useAppDispatch()
  const resolvedParams = use(params)
  const slug = resolvedParams.slug

  const product = useAppSelector(selectProductDetails)
  const isLoading = useAppSelector(selectDetailsLoading)

  useEffect(() => {
    if (slug) {
      const decodedSlug = decodeURIComponent(slug)
      dispatch(getProductBySlug(decodedSlug))
    }

    // پاکسازی هنگام خروج از صفحه
    return () => {
      dispatch(clearProductDetail())
    }
  }, [slug, dispatch])

  // بعد از دریافت محصول، نظرات و پرسش‌ها و محصولات مرتبط رو fetch کن
  useEffect(() => {
    if (product?.productId) {
      dispatch(fetchProductReviews({ productId: product.productId }))
      dispatch(fetchProductQuestions({ productId: product.productId }))
      dispatch(fetchRelatedProducts(product.productId))
    }
  }, [product?.productId, dispatch])

  // استخراج مشخصات فنی از featureValues
  const specifications = product?.featureValues?.map((fv: any) => ({
    featureValueId: fv.featureValueId,
    featureName: fv.featureDefinition?.name || fv.featureName || 'ویژگی',
    valueString: fv.valueString,
    valueNumeric: fv.valueNumeric,
  })) || []

  // ساخت تب‌ها
  const tabs = [
    {
      id: 'specifications',
      label: 'مشخصات فنی',
      content: <ProductSpecifications specifications={specifications} />,
    },
    {
      id: 'reviews',
      label: 'نظرات کاربران',
      content: <ProductReviews />,
    },
    {
      id: 'questions',
      label: 'پرسش و پاسخ',
      content: <ProductQuestions />,
    },
  ]

  // اضافه کردن تب توضیحات اگر fullDescription وجود داشته باشه
  if (product?.fullDescription) {
    tabs.unshift({
      id: 'description',
      label: 'توضیحات محصول',
      content: (
        <div className={styles.descriptionTab}>
          <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
        </div>
      ),
    })
  }

  useEffect(() => {
  console.log('🛒 product?.productId:', product?.productId);
  if (product?.productId) {
    console.log('📡 Dispatching fetchRelatedProducts for:', product.productId);
    dispatch(fetchProductReviews({ productId: product.productId }))
    dispatch(fetchProductQuestions({ productId: product.productId }))
    dispatch(fetchRelatedProducts(product.productId))
  }
}, [product?.productId, dispatch])

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonGallery}></div>
          <div className={styles.skeletonInfo}></div>
          <div className={styles.skeletonBuyBox}></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.notFound}>
          <h2>محصول مورد نظر یافت نشد</h2>
          <p>لطفاً از طریق جستجو محصول مورد نظر خود را پیدا کنید.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      {/* ========================================== */}
      {/* بخش بالای صفحه (گرید ۳ ستونه مثل دیجی‌کالا) */}
      {/* ========================================== */}
      <section className={styles.topSection}>
        {/* ستون راست: گالری عکس */}
        <div className={styles.galleryColumn}>
          <ProductGallery slug={slug} />
        </div>

        {/* ستون وسط: اطلاعات محصول */}
        <div className={styles.infoColumn}>
          <ProductInfo />
        </div>

        {/* ستون چپ: باکس خرید */}
        <div className={styles.buyBoxColumn}>
          <BuyBox />
        </div>
      </section>

      {/* ========================================== */}
      {/* بخش پایین: تب‌ها (مشخصات، نظرات، پرسش) */}
      {/* ========================================== */}
      <section className={styles.bottomSection}>
        <div className={styles.tabsWrapper}>
          <ProductTabs tabs={tabs} defaultTab="specifications" />
        </div>
      </section>

      
      <section className={styles.relatedSection}>
        <RelatedProducts />
      </section>
    </div>
  )
}