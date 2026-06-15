import { ProductImageSimple } from "../ProductImage/ProductImage";
import { ProductSkuSimple } from "../ProductSku/ProductSku";

export interface ProductDetails {
    productId: number;
    productName: string;
    productCode: string;
    fullDescription?: string;
  shortDescription?: string;
    categoryName: string;
    brandName: string;
    categoryId: number;
    brandId: number;
    totalStock: number;
    isActive: boolean;
    // لیست‌های مرتبط
    skus: ProductSkuSimple[];
    images: ProductImageSimple[];
}