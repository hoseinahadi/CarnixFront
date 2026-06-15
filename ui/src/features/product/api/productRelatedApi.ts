import axiosInstance from '@/services/api/common/axiosInstance';

export const productRelatedApi = {
  // دریافت محصولات مرتبط
  getRelatedProducts: async (productId: number) =>
    await axiosInstance.get(`/ProductRelated/product/${productId}`),
};