import axiosInstance from '@/services/api/common/axiosInstance';

export interface CreateQuestionRequest {
  productId: number;
  questionText: string;
}

export const productQuestionApi = {
  // دریافت پرسش‌های یک محصول
  getProductQuestions: async (productId: number, page: number = 1, pageSize: number = 10) =>
    await axiosInstance.get(`/ProductQuestion/product/${productId}`, {
      params: { page, pageSize }
    }),

  // ثبت پرسش جدید
  createQuestion: async (data: CreateQuestionRequest) =>
    await axiosInstance.post('/ProductQuestion/create', data),
};