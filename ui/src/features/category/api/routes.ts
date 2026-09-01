import axiosClient from '@/services/api/common/axiosClient';
import { Category } from '@/models/category/Category';
import { CreateCategoryDto } from '@/models/category/CreateCategoryDto';
import { UpdateCategoryDto } from '@/models/category/UpdateCategoryDto';
import { OperationResult } from '@/models/common/OperationResult';

const BASE_URL = '/Category';

export const CategoryApi = {
  // دریافت کل درخت (در صورت نیاز به منوی یکپارچه) یا فقط سطح اول
  getMenu: async () => {
    return await axiosClient.get<OperationResult<any>>(`${BASE_URL}/menu`);
  },

  // 🟢 متد جدید برای لود داینامیک زیردسته‌های یک دسته‌بندی خاص
  getSubCategories: async (parentId: number) => {
    return await axiosClient.get<OperationResult<any>>(`${BASE_URL}/${parentId}/subcategories`);
  },

  // متد صفحه‌بندی شده برای استفاده در پنل ادمین
  getAll: async (page: number = 1, pageSize: number = 50) => {
    return await axiosClient.get<OperationResult<any>>(`${BASE_URL}?page=${page}&pageSize=${pageSize}`);
  },

  getById: async (id: number) => {
    return await axiosClient.get<Category>(`${BASE_URL}/${id}`);
  },

  search: async (keyword: string) => {
    return await axiosClient.get<Category[]>(`${BASE_URL}/search`, {
      params: { keyword, page: 1, pageSize: 50 }
    });
  },

  create: async (payload: CreateCategoryDto) => {
    return await axiosClient.post<Category>(BASE_URL, payload);
  },

  update: async (id: number, payload: UpdateCategoryDto) => {
    return await axiosClient.put<Category>(`${BASE_URL}/${id}`, payload);
  },

  delete: async (id: number) => {
    return await axiosClient.delete(`${BASE_URL}/${id}`);
  },

  bulkCreate: async (payload: CreateCategoryDto[]) => {
    return await axiosClient.post<Category[]>(`${BASE_URL}/bulk`, payload);
  },

  bulkDelete: async (ids: number[]) => {
    return await axiosClient.delete(`${BASE_URL}/bulk`, { data: ids });
  }
};