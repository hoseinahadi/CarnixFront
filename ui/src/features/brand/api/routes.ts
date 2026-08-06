// features/brand/BrandApi.ts

import axiosClient from '@/services/api/common/axiosClient';
import type { Brand } from '@/models/brand/Brand';
import { OperationResult } from '@/models/common/OperationResult';

export const BrandApi = {
  // دریافت همه برندها
  getAll: async () =>
    await axiosClient.get<OperationResult<Brand[]>>('/brands/get-all'),

  // دریافت یک برند با شناسه
  getById: async (id: number) =>
    await axiosClient.get<OperationResult<Brand>>(`/brands/get-by-id/${id}`),

  // ایجاد برند جدید
  create: async (data: Brand) =>
    await axiosClient.post<OperationResult<Brand>>('/brands/create', data),

  // ویرایش برند
  update: async (id: number, data: Brand) =>
    await axiosClient.put<OperationResult<Brand>>(`/brands/update/${id}`, data),

  // حذف برند
  delete: async (id: number) =>
    await axiosClient.delete<OperationResult<boolean>>(`/brands/delete/${id}`),
};
