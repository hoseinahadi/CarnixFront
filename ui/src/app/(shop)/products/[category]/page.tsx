import { Suspense } from 'react'
import CategoryProductsContent from './CategoryProductsContent'
import type { Category } from '@/models/category/Category'

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
      return res.data.data.map((cat: Category) => ({
        category: cat.slug || String(cat.categoryId),
      }))
    }
  } catch (error) {
    if (process.env.STRICT_SSG_DATA === 'true') {
      throw new Error('Category data is required for strict static generation', { cause: error })
    }
    console.warn('Could not fetch categories for static generation; paths will be generated on demand.', error)
  }
  return []
}

export const dynamicParams = true

export default function CategoryProductsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <CategoryProductsContent params={params} />
    </Suspense>
  )
}
