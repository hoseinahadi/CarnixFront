import React from 'react'
import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/home/HeroSection/HeroSection'
import { FadeInScroll } from '@/components/utils/scroll/FadeInScroll'

// ==========================================
// 🚀 Lazy Loading Components
// ==========================================

const CategorySliderWidget = dynamic(
  () => import('@/components/category/category'),
  { loading: () => <div className="p-4 text-center text-gray-500">در حال بارگذاری دسته‌بندی‌ها...</div> }
)

const BestSellersSection = dynamic(
  () => import('@/components/home/BestSellersSection/BestSellersSection'),
  { loading: () => <div className="p-4 text-center text-gray-500">در حال بارگذاری پرفروش‌ترین‌ها...</div> }
)

const BulkPurchaseBanner = dynamic(
  () => import('@/components/home/BulkPurchaseBanner/BulkPurchaseBanner'),
  { loading: () => <div className="p-4 text-center text-gray-500">در حال بارگذاری بنر...</div> }
)

const FeaturedProductsSection = dynamic(
  () => import('@/components/home/FeaturedProductsSection/FeaturedProductsSection'),
  { loading: () => <div className="p-4 text-center text-gray-500">در حال بارگذاری محصولات ویژه...</div> }
)

const ArticlesSection = dynamic(
  () => import('@/components/home/ArticlesSection/ArticlesSection'),
  { loading: () => <div className="p-4 text-center text-gray-500">در حال بارگذاری مقالات...</div> }
)

const Home = () => {
  return (
    <div>
      {/* هیرو سکشن فقط اسلایدر و فرم جستجو */}
      <HeroSection />

      {/* ✅ دسته‌بندی‌ها بعد از اسلایدر، پایین‌تر از آن */}
      <section className="container-max-width my-xxxl">
        <FadeInScroll>
          <CategorySliderWidget />
        </FadeInScroll>
      </section>

      <section className="container-max-width my-xxxl">
        <FadeInScroll>
          <BestSellersSection />
        </FadeInScroll>
      </section>

      <section className="container-max-width my-xxxl">
        <FadeInScroll>
          <BulkPurchaseBanner />
        </FadeInScroll>
      </section>
      
      <section className="container-max-width my-xxxl">
        <FadeInScroll>
          <FeaturedProductsSection />
        </FadeInScroll>
      </section>

      <section className="container-max-width my-xxxl">
        <FadeInScroll>
          <ArticlesSection />
        </FadeInScroll>
      </section>
    </div>
  )
}

export default Home