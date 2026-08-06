// مسیر: src/store/feature/product/productSelectors.ts
// (یا هر مسیری که فایل سلکتورهای اصلی محصولت قرار دارد)

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
export const selectProductDetails = (state: RootState) => state.product.productDetails;

// ✅ 🟢 داده‌های تکمیلی (اضافه شده برای باندل و قیمت)
export const selectEffectivePrice = (state: RootState) => state.product.effectivePrice;
export const selectProductBundles = (state: RootState) => state.product.bundles;
// مسیر: src/store/feature/product/productSelectors.ts

// 🟢 جدیدترین محصولات
export const selectNewestProducts = (state: RootState) => state.product.newestProducts;
export const selectNewestLoading = (state: RootState) => state.product.newestLoading;