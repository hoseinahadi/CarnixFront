// src/models/product/ProductBundle.ts

export interface ProductBundleItemDto {
  productBundleItemId: number;
  productBundleId: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice?: number;
}

export interface ProductBundleDto {
  productBundleId: number;
  name: string;
  description?: string;
  isActive: boolean;
  items?: ProductBundleItemDto[];
}