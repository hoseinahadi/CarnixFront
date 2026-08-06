import type { OperationResult } from '@/models/common/OperationResult';
import axiosClient from '@/services/api/common/axiosClient';

export interface RelatedProductApiItem {
  relatedProductId?: number;
  productId?: number;
  productName?: string;
  relatedProductName?: string;
  basePrice?: number;
  effectivePrice?: number;
  price?: number;
  imageUrl?: string;
  categoryName?: string;
  relatedProduct?: Record<string, unknown>;
  product?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface RelatedProductsPayload {
  all?: RelatedProductApiItem[];
  items?: RelatedProductApiItem[];
  products?: RelatedProductApiItem[];
  sameCategory?: RelatedProductApiItem[];
  sameBrand?: RelatedProductApiItem[];
  [key: string]: unknown;
}

export type RelatedProductsResponse =
  | RelatedProductApiItem[]
  | RelatedProductsPayload;

export const productRelatedApi = {
  getRelatedProducts: (productId: number) =>
    axiosClient.get<OperationResult<RelatedProductsResponse>>(
      `/ProductRelated/product/${productId}`,
    ),
};
