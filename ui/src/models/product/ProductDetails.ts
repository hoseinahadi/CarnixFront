import type { FeatureValueItem } from '@/models/Featurevalues/FeatureValueItem';
import type { ProductImageSimple } from '@/models/ProductImage/ProductImage';
import type { ProductSkuSimple } from '@/models/ProductSku/ProductSku';

export interface ProductDetails {
  productId: number;
  productName: string;
  productCode: string;
  productSlug?: string;
  slug?: string;

  fullDescription?: string;
  shortDescription?: string;

  categoryName: string;
  brandName: string;
  categoryId: number;
  brandId: number;

  basePrice?: number;
  effectivePrice?: number;
  totalStock: number;
  isActive: boolean;
  imageUrl?: string;

  featureValues: FeatureValueItem[];
  skus: ProductSkuSimple[];
  images: ProductImageSimple[];
}
