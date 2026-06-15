// features/product/api/productApi.ts (آپدیت - اضافه کردن getFiltered)

import { OperationResult } from "@/models/common/OperationResult";
import axiosInstance from "@/services/api/common/axiosInstance";
import { ProductFilters } from "@/models/product/ProductFilters";
import { Product } from "@/models/product/Product";
import { ProductDetails } from "@/models/product/ProductDetails";
import { PagedResult } from "@/models/common/PagedResult";
import { ProductFilterParams } from "../product/productFilterApi";

export const ProductApi = {
  getAll: async (filters?: ProductFilters) =>
    await axiosInstance.get<OperationResult<Product[]>>('/Product/GetAll', { params: filters }),

  getDetails: async (id: number | string) =>
    await axiosInstance.get<OperationResult<ProductDetails>>(`/Product/${id}/details`),

  getById: async (id: number | string) =>
    await axiosInstance.get<OperationResult<Product>>(`/Product/${id}`),

  search: async (keyword: string) =>
    await axiosInstance.get<OperationResult<Product[]>>('/Product/search', { params: { keyword } }),
    
  getBySlug: async (name: string) =>
    await axiosInstance.get<OperationResult<ProductDetails>>(`/Product/${name}`),

  getBestSellers: async (pageNumber: number = 1, pageSize: number = 5, includeAll: boolean = true) =>
    await axiosInstance.get<OperationResult<PagedResult<Product>>>('/Product/best-sellers', {
      params: { pageNumber, pageSize, includeAll }
    }),

  getFeaturedPaged: async (pageNumber: number = 1, pageSize: number = 5) =>
    await axiosInstance.get<OperationResult<PagedResult<Product>>>('/Product/featured-paged', {
      params: { pageNumber, pageSize }
    }),

  getDiscountedPaged: async (pageNumber: number = 1, pageSize: number = 5) =>
    await axiosInstance.get<OperationResult<PagedResult<Product>>>('/Product/discounted-paged', {
      params: { pageNumber, pageSize }
    }),

  // ⭐ جدید
  getFiltered: async (params: ProductFilterParams) =>
    await axiosInstance.get('/Product/filtered', { params }),
};