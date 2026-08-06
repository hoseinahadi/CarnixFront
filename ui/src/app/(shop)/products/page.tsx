import { Suspense } from 'react'
import ProductsContent from './ProductsContent'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>در حال بارگذاری...</div>}>
      <ProductsContent />
    </Suspense>
  )
}