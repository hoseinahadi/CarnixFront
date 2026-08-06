import axiosClient from '@/services/api/common/axiosClient';

export const wishlistApi = {
  // دریافت لیست علاقه‌مندی‌ها
  getMyWishlist: async () =>
    await axiosClient.get('/Wishlist'),

  // افزودن به علاقه‌مندی‌ها
  addToWishlist: async (productId: number) =>
    await axiosClient.post('/Wishlist/add', { productId }),

  // حذف از علاقه‌مندی‌ها
  removeFromWishlist: async (productId: number) =>
    await axiosClient.delete(`/Wishlist/remove/${productId}`),

  // پاک کردن کل لیست
  clearWishlist: async () =>
    await axiosClient.delete('/Wishlist/clear'),
};