import axiosInstance from '@/services/api/common/axiosInstance';

export interface CreateReviewRequest {
  productId: number;
  title?: string;
  content: string;
  rating: number;
}

export const productReviewApi = {
  // دریافت نظرات یک محصول
  getProductReviews: async (productId: number, page: number = 1, pageSize: number = 10) =>
    await axiosInstance.get(`/ProductReview/product/${productId}`, {
      params: { page, pageSize }
    }),

  // ثبت نظر جدید
  createReview: async (data: CreateReviewRequest) =>
    await axiosInstance.post('/ProductReview/create', data),

  // رأی مفید به نظر
  markHelpful: async (reviewId: number) =>
    await axiosInstance.post(`/ProductReview/${reviewId}/helpful`),
};