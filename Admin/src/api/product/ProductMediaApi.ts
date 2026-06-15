// features/products/api/ProductMediaApi.ts

import axiosInstance from '@/api/common/axiosInstance';
import type { 
  ProductImageDto, 
  ProductVideoDto, 
  Product360ViewDto,
  AddProductMediaDto
} from '@/models/product/ProductMedia';
import type { OperationResult } from '@/models/common/OperationResult'; // مسیر فرضی

export const ProductMediaApi = {
  // ─── Images ────────────────────────────────────────────────────────
  getImagesByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<ProductImageDto[]>>(`/product-images/get-by-product/${productId}`),
  
  addImage: async (data: AddProductMediaDto) =>
    await axiosInstance.post<OperationResult<ProductImageDto>>('/product-images/Create', data),

  deleteImage: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-images/Delete/${id}`),

  // ─── Videos ────────────────────────────────────────────────────────
  getVideosByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<ProductVideoDto[]>>(`/product-videos/get-by-product/${productId}`),

  addVideo: async (data: AddProductMediaDto) =>
    await axiosInstance.post<OperationResult<ProductVideoDto>>('/product-videos/Create', data),

  deleteVideo: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-videos/Delete/${id}`),

  // ─── 360 Views ─────────────────────────────────────────────────────
  get360ViewsByProductId: async (productId: number | string) =>
    await axiosInstance.get<OperationResult<Product360ViewDto[]>>(`/product-360-views/get-by-product/${productId}`),

  add360View: async (data: AddProductMediaDto) =>
    await axiosInstance.post<OperationResult<Product360ViewDto>>('/product-360-views/Create', data),

  delete360View: async (id: number | string) =>
    await axiosInstance.delete<OperationResult<boolean>>(`/product-360-views/Delete/${id}`),
};
