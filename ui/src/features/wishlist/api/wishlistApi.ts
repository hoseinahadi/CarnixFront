import axiosClient from '@/services/api/common/axiosClient';
import {
  getCachedRequest,
  invalidateRequestCache,
} from '@/services/api/common/requestCache';

const WISHLIST_CACHE_KEY = 'wishlist:me';
const WISHLIST_CACHE_TTL_MS = 30_000;

const invalidateWishlist = (): void => {
  invalidateRequestCache(WISHLIST_CACHE_KEY);
};

export const wishlistApi = {
  // دریافت لیست علاقه‌مندی‌ها؛ StrictMode/Remount درخواست تکراری ایجاد نمی‌کند.
  getMyWishlist: () =>
    getCachedRequest(
      WISHLIST_CACHE_KEY,
      () => axiosClient.get('/Wishlist'),
      WISHLIST_CACHE_TTL_MS,
    ),

  addToWishlist: async (productId: number) => {
    const response = await axiosClient.post('/Wishlist/add', { productId });
    invalidateWishlist();
    return response;
  },

  removeFromWishlist: async (productId: number) => {
    const response = await axiosClient.delete(`/Wishlist/remove/${productId}`);
    invalidateWishlist();
    return response;
  },

  clearWishlist: async () => {
    const response = await axiosClient.delete('/Wishlist/clear');
    invalidateWishlist();
    return response;
  },

  invalidateCache: invalidateWishlist,
};
