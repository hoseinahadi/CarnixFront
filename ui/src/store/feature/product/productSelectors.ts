import type { RootState } from '@/store';

// ============================================================
// MAIN PRODUCTS
// ============================================================

export const selectProducts = (
  state: RootState,
) =>
  state.product.products;

export const selectProductsLoading = (
  state: RootState,
) =>
  state.product.loading;

export const selectProductsStatus = (
  state: RootState,
) =>
  state.product.productsStatus;

// ============================================================
// BEST SELLERS
// ============================================================

export const selectBestSellers = (
  state: RootState,
) =>
  state.product.bestSellers;

export const selectBestSellersLoading = (
  state: RootState,
) =>
  state.product.bestSellersLoading;

export const selectBestSellersStatus = (
  state: RootState,
) =>
  state.product.bestSellersStatus;

// ============================================================
// FEATURED PRODUCTS
// ============================================================

export const selectFeaturedProducts = (
  state: RootState,
) =>
  state.product.featuredProducts;

export const selectFeaturedLoading = (
  state: RootState,
) =>
  state.product.featuredLoading;

export const selectFeaturedStatus = (
  state: RootState,
) =>
  state.product.featuredStatus;

// ============================================================
// DISCOUNTED PRODUCTS
// ============================================================

export const selectDiscountedProducts = (
  state: RootState,
) =>
  state.product.discountedProducts;

export const selectDiscountedLoading = (
  state: RootState,
) =>
  state.product.discountedLoading;

export const selectDiscountedStatus = (
  state: RootState,
) =>
  state.product.discountedStatus;

// ============================================================
// NEWEST PRODUCTS
// ============================================================

export const selectNewestProducts = (
  state: RootState,
) =>
  state.product.newestProducts;

export const selectNewestLoading = (
  state: RootState,
) =>
  state.product.newestLoading;

export const selectNewestStatus = (
  state: RootState,
) =>
  state.product.newestStatus;

// ============================================================
// PRODUCT DETAILS
// ============================================================

export const selectDetailsLoading = (
  state: RootState,
) =>
  state.product.detailsLoading;

export const selectDetailsStatus = (
  state: RootState,
) =>
  state.product.detailsStatus;

export const selectSelectedProduct = (
  state: RootState,
) =>
  state.product.selectedProduct;

export const selectProductDetails = (
  state: RootState,
) =>
  state.product.productDetails;

// ============================================================
// PRODUCT ACTIONS
// ============================================================

export const selectProductsActionLoading = (
  state: RootState,
) =>
  state.product.actionLoading;

// ============================================================
// ERRORS
// ============================================================

export const selectProductsError = (
  state: RootState,
) =>
  state.product.error;

export const selectProductListErrors = (
  state: RootState,
) =>
  state.product.listErrors;

// ============================================================
// PDP ADDITIONAL DATA
// ============================================================

export const selectEffectivePrice = (
  state: RootState,
) =>
  state.product.effectivePrice;

export const selectProductBundles = (
  state: RootState,
) =>
  state.product.bundles;

// ============================================================
// RELATED PRODUCTS
// ============================================================

export const selectRelatedProducts = (
  state: RootState,
) =>
  state.product.relatedProducts;