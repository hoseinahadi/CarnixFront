// src/services/api/product/productApi.ts

import { OperationResult } from "@/models/common/OperationResult";
import axiosClient from "@/services/api/common/axiosClient";
import { ProductFilters } from "@/models/product/ProductFilters";
import { Product } from "@/models/product/Product";
import { ProductDetails } from "@/models/product/ProductDetails";
import { PagedResult } from "@/models/common/PagedResult";
import { ProductFilterParams } from "@/models/product/ProductFilters";
import { ProductBundleDto } from "@/models/ProductBundle/ProductBundle";

export const ProductApi = {
  // 🟢 اصلاح شد: اتصال به اکشن پیشرفته filtered در بک‌اند برای پشتیبانی کامل از فیلترها و ماشین‌ها
  getAll: async (filters?: ProductFilters & { vehicleIds?: any; page?: number; pageSize?: number }) => {
    let formattedParams: any = { ...filters };

    // تبدیل ساختار vehicleIds به رشته مورد انتظار بک‌اند (مثلاً "1-5")
    if (filters?.vehicleIds && Array.isArray(filters.vehicleIds) && filters.vehicleIds.length > 0) {
      formattedParams.vehicleIds = filters.vehicleIds
        .map((v: any) => `${v.makeId}-${v.modelId}`)
        .join(',');
    } else {
      delete formattedParams.vehicleIds;
    }

    return await axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/filtered', { params: formattedParams });
  },

  getDetails: async (id: number | string) =>
    await axiosClient.get<OperationResult<ProductDetails>>(`/Product/${id}/details`),

  getById: async (id: number | string) =>
    await axiosClient.get<OperationResult<Product>>(`/Product/${id}`),

  search: async (keyword: string) =>
    await axiosClient.get<OperationResult<Product[]>>('/Product/search', { params: { keyword } }),
    
  getBySlug: async (name: string) =>
    await axiosClient.get<OperationResult<ProductDetails>>(`/Product/${name}`),

  getBestSellers: async (pageNumber: number = 1, pageSize: number = 5, includeAll: boolean = true) =>
    await axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/best-sellers', {
      params: { pageNumber, pageSize, includeAll }
    }),

  getFeaturedPaged: async (pageNumber: number = 1, pageSize: number = 5) =>
    await axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/featured-paged', {
      params: { pageNumber, pageSize }
    }),

  getDiscountedPaged: async (pageNumber: number = 1, pageSize: number = 5) =>
    await axiosClient.get<OperationResult<PagedResult<Product>>>('/Product/discounted-paged', {
      params: { pageNumber, pageSize }
    }),

  getFiltered: async (params: ProductFilterParams) =>
    await axiosClient.get('/Product/filtered', { params }),

  getEffectivePrice: async (productId: number | string) =>
    await axiosClient.get<OperationResult<number>>(`/ProductPricing/${productId}/effective-price`),

  getAllBundles: async () =>
    await axiosClient.get<OperationResult<ProductBundleDto[]>>('/product-bundles/get-all'),
};