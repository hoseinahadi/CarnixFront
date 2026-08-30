// src/services/api/product/productApi.ts

import { OperationResult } from "@/models/common/OperationResult";
import axiosClient from "@/services/api/common/axiosClient";
import { ProductFilters } from "@/models/product/ProductFilters";
import { Product } from "@/models/product/Product";
import { ProductDetails } from "@/models/product/ProductDetails";
import { PagedResult } from "@/models/common/PagedResult";
import { createProductFilterRequestKey, ProductFilterParams } from "@/models/product/ProductFilters";
import { ProductBundleDto } from "@/models/ProductBundle/ProductBundle";
import { getCachedRequest } from "@/services/api/common/requestCache";

export const ProductApi = {
  // 🟢 اصلاح شد: اتصال به اکشن پیشرفته filtered در بک‌اند برای پشتیبانی کامل از فیلترها و ماشین‌ها
  getAll: (filters?: ProductFilters & { vehicleIds?: any; page?: number; pageSize?: number }) => {
    const formattedParams: any = { ...filters };

    if (filters?.vehicleIds && Array.isArray(filters.vehicleIds) && filters.vehicleIds.length > 0) {
      formattedParams.vehicleIds = filters.vehicleIds
        .map((v: any) => `${v.makeId}-${v.modelId}`)
        .join(',');
    } else {
      delete formattedParams.vehicleIds;
    }

    const key = `product:all:${createProductFilterRequestKey(filters ?? {})}`;
    return getCachedRequest(
      key,
      () => axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/filtered', { params: formattedParams }),
      15_000,
    );
  },

  getDetails: (id: number | string) =>
    getCachedRequest(
      `product:details:${id}`,
      () => axiosClient.get<OperationResult<ProductDetails>>(`/Product/${id}/details`),
      30_000,
    ),

  getById: (id: number | string) =>
    getCachedRequest(
      `product:by-id:${id}`,
      () => axiosClient.get<OperationResult<Product>>(`/Product/${id}`),
      30_000,
    ),

  search: (keyword: string) => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('fa-IR');
    return getCachedRequest(
      `product:search:${normalizedKeyword}`,
      () => axiosClient.get<OperationResult<Product[]>>('/Product/search', { params: { keyword: keyword.trim() } }),
      30_000,
    );
  },
    
  getBySlug: (name: string) => {
    const normalizedName = name.trim();
    const isNumericId = /^\d+$/.test(normalizedName);
    const endpoint = isNumericId
      ? `/Product/${normalizedName}/details`
      : `/Product/${encodeURIComponent(normalizedName)}`;

    return getCachedRequest(
      `product:slug:${normalizedName.toLocaleLowerCase('fa-IR')}`,
      () => axiosClient.get<OperationResult<ProductDetails>>(endpoint),
      30_000,
    );
  },

  getBestSellers: (pageNumber: number = 1, pageSize: number = 5, includeAll: boolean = true) =>
    getCachedRequest(
      `product:best-sellers:${pageNumber}:${pageSize}:${includeAll}`,
      () => axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/best-sellers', {
        params: { pageNumber, pageSize, includeAll }
      }),
      60_000,
    ),

  getFeaturedPaged: (pageNumber: number = 1, pageSize: number = 5) =>
    getCachedRequest(
      `product:featured:${pageNumber}:${pageSize}`,
      () => axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/featured-paged', {
        params: { pageNumber, pageSize }
      }),
      60_000,
    ),

  getDiscountedPaged: (pageNumber: number = 1, pageSize: number = 5) =>
    getCachedRequest(
      `product:discounted:${pageNumber}:${pageSize}`,
      () => axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/discounted-paged', {
        params: { pageNumber, pageSize }
      }),
      60_000,
    ),

  getFiltered: (params: ProductFilterParams) =>
    getCachedRequest(
      `product:filtered:${createProductFilterRequestKey(params)}`,
      () => axiosClient.get('/Product/filtered', { params }),
      30_000,
    ),

  getEffectivePrice: (productId: number | string) =>
    getCachedRequest(
      `product:effective-price:${productId}`,
      () => axiosClient.get<OperationResult<number>>(`/ProductPricing/${productId}/effective-price`),
      30_000,
    ),

  // این endpoint همه bundleها را برمی‌گرداند؛ روی هر PDP نباید مجدداً دانلود شود.
  getAllBundles: () =>
    getCachedRequest(
      'product-bundles:all',
      () => axiosClient.get<OperationResult<ProductBundleDto[]>>('/product-bundles/get-all'),
      5 * 60_000,
    ),
};