import { ProductDiscount } from "../ProductDiscount/ProductDiscount";

export interface Product {
  productId: number; // بهتر است شناسه همیشه عدد باشد
  productName: string; // نام نمایشی در جدول
  productCode?: string; // اگر در سرور نیست، اختیاری باشد
  fullDescription?: string;
  shortDescription?: string;
  basePrice: number;
  totalStock: number;
  categoryId: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  isActive: boolean;
  imageUrl?: string;
  createdAt?: string;
  displayOrder?: number;
  isFeatured:boolean;
  productDiscount?:ProductDiscount;
}