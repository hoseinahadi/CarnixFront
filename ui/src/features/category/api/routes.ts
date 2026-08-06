import axiosClient from '@/services/api/common/axiosClient';
import { Category } from '@/models/category/Category';
import { CreateCategoryDto } from '@/models/category/CreateCategoryDto';
import { UpdateCategoryDto } from '@/models/category/UpdateCategoryDto';
import { OperationResult } from '@/models/common/OperationResult';

const BASE_URL = '/Category';

export const CategoryApi = {
  // 🟢 تطبیق کامل با متد GetAll کنترلر شما (ارسال page و pageSize مطابق با MaxPageSize = 50)
  getAll: async () => {
    return await axiosClient.get<OperationResult<any>>(`${BASE_URL}?page=1&pageSize=50`);
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