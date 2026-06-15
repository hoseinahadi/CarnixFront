// مسیر: src/features/products/store/productSelectors.ts

import type { RootState } from '@/store';

// لیست اصلی محصولات
export const selectProducts = (state: RootState) => state.product.products;
export const selectProductsLoading = (state: RootState) => state.product.loading;

// پرفروش‌ترین محصولات 
export const selectBestSellers = (state: RootState) => state.product.bestSellers;
export const selectBestSellersLoading = (state: RootState) => state.product.bestSellersLoading;

// 🟢 محصولات ویژه
export const selectFeaturedProducts = (state: RootState) => state.product.featuredProducts;
export const selectFeaturedLoading = (state: RootState) => state.product.featuredLoading;

// 🟢 محصولات تخفیف‌دار
export const selectDiscountedProducts = (state: RootState) => state.product.discountedProducts;
export const selectDiscountedLoading = (state: RootState) => state.product.discountedLoading;

// جزئیات و اکشن‌های محصول
export const selectDetailsLoading = (state: RootState) => state.product.detailsLoading;
export const selectProductsActionLoading = (state: RootState) => state.product.actionLoading;
export const selectProductsError = (state: RootState) => state.product.error;
export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct;

// سلکتور مخصوص مدال جزئیات یا صفحه PDP
export const selectProductDetails = (state: RootState) => state.product.productDetails;
