import { Suspense } from 'react'
import CategoryProductsContent from './CategoryProductsContent'

interface PageProps {
  params: Promise<{ category: string }>
}

// این تابع لیست مسیرهای داینامیک را در زمان بیلد تولید می‌کند
export async function generateStaticParams() {
  try {
    // گرفتن لیست دسته‌بندی‌ها از API (در صورت دسترس بودن در زمان بیلد)
    const { CategoryApi } = await import('@/features/category/api/routes')
    const res = await CategoryApi.getAll()
    
    if (res.data?.isSuccess && Array.isArray(res.data.data)) {
      return res.data.data.map((cat: any) => ({
        category: cat.slug || String(cat.categoryId),
      }))
    }
  } catch (error) {
    console.warn('Could not fetch categories for static generation, fallbacking to default params.', error)
  }

  // مقدار رزرو در صورت قطع بودن API در زمان بیلد یا برای تست اولیه
  return [
    { category: 'all' },
  ]
}

export default function CategoryProductsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <CategoryProductsContent params={params} />
    </Suspense>
  )
}