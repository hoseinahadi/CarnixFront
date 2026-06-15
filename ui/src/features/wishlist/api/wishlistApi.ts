import axiosInstance from '@/services/api/common/axiosInstance';

export const wishlistApi = {
  // دریافت لیست علاقه‌مندی‌ها
  getMyWishlist: async () =>
    await axiosInstance.get('/Wishlist'),

  // افزودن به علاقه‌مندی‌ها
  addToWishlist: async (productId: number) =>
    await axiosInstance.post('/Wishlist/add', { productId }),

  // حذف از علاقه‌مندی‌ها
  removeFromWishlist: async (productId: number) =>
    await axiosInstance.delete(`/Wishlist/remove/${productId}`),

  // پاک کردن کل لیست
  clearWishlist: async () =>
    await axiosInstance.delete('/Wishlist/clear'),
};