import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { Product } from '@/models/product/Product';
import type { ProductDetails } from '@/models/product/ProductDetails';
import type { PagedResult } from '@/models/common/PagedResult';

import {
  fetchPDPAdditionalData,
  getAllProducts,
  getBestSellingProducts,
  getDiscountedProductsPaged,
  getFeaturedProductsPaged,
  getNewestProductsPaged,
  getProductBySlug,
  getProductDetails,
} from './productThunks';

// ============================================================
// TYPES
// ============================================================

export type ProductRequestStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface ProductListErrors {
  products: string | null;
  bestSellers: string | null;
  featured: string | null;
  discounted: string | null;
  newest: string | null;
  details: string | null;
}

interface ProductState {
  // ==========================================================
  // DATA
  // ==========================================================

  products:
    | PagedResult<Product>
    | null;

  bestSellers:
    | PagedResult<Product>
    | null;

  featuredProducts:
    | PagedResult<Product>
    | null;

  discountedProducts:
    | PagedResult<Product>
    | null;

  newestProducts:
    | PagedResult<Product>
    | null;

  selectedProduct:
    | Product
    | null;

  productDetails:
    | ProductDetails
    | null;

  bundles: any[];

  effectivePrice:
    | number
    | null;

  relatedProducts: Product[];

  // ==========================================================
  // STATUS
  // ==========================================================

  productsStatus:
    ProductRequestStatus;

  bestSellersStatus:
    ProductRequestStatus;

  featuredStatus:
    ProductRequestStatus;

  discountedStatus:
    ProductRequestStatus;

  newestStatus:
    ProductRequestStatus;

  detailsStatus:
    ProductRequestStatus;

  // ==========================================================
  // REQUEST IDS
  // ==========================================================

  productsRequestId:
    | string
    | null;

  bestSellersRequestId:
    | string
    | null;

  featuredRequestId:
    | string
    | null;

  discountedRequestId:
    | string
    | null;

  newestRequestId:
    | string
    | null;

  detailsRequestId:
    | string
    | null;

  // ==========================================================
  // LOADING
  // ==========================================================

  loading: boolean;

  bestSellersLoading: boolean;

  featuredLoading: boolean;

  discountedLoading: boolean;

  newestLoading: boolean;

  detailsLoading: boolean;

  actionLoading: boolean;

  // ==========================================================
  // ERROR
  // ==========================================================

  error:
    | string
    | null;

  listErrors:
    ProductListErrors;
}

// ============================================================
// INITIAL STATE
// ============================================================

const initialState: ProductState = {
  // DATA

  products: null,

  bestSellers: null,

  featuredProducts: null,

  discountedProducts: null,

  newestProducts: null,

  selectedProduct: null,

  productDetails: null,

  bundles: [],

  effectivePrice: null,

  relatedProducts: [],

  // STATUS

  productsStatus: 'idle',

  bestSellersStatus: 'idle',

  featuredStatus: 'idle',

  discountedStatus: 'idle',

  newestStatus: 'idle',

  detailsStatus: 'idle',

  // REQUEST IDS

  productsRequestId: null,

  bestSellersRequestId: null,

  featuredRequestId: null,

  discountedRequestId: null,

  newestRequestId: null,

  detailsRequestId: null,

  // LOADING

  loading: false,

  bestSellersLoading: false,

  featuredLoading: false,

  discountedLoading: false,

  newestLoading: false,

  detailsLoading: false,

  actionLoading: false,

  // ERRORS

  error: null,

  listErrors: {
    products: null,
    bestSellers: null,
    featured: null,
    discounted: null,
    newest: null,
    details: null,
  },
};

// ============================================================
// SLICE
// ============================================================

const productSlice =
  createSlice({
    name: 'products',

    initialState,

    reducers: {
      // ========================================================
      // SELECT PRODUCT
      // ========================================================

      setSelectedProduct: (
        state,
        action: PayloadAction<
          Product | null
        >,
      ) => {
        state.selectedProduct =
          action.payload;
      },

      // ========================================================
      // SSR / HYDRATION PRODUCT DETAILS
      // ========================================================

      setProductDetails: (
        state,
        action: PayloadAction<
          ProductDetails | null
        >,
      ) => {
        state.productDetails =
          action.payload;

        state.detailsLoading =
          false;

        state.detailsStatus =
          action.payload
            ? 'succeeded'
            : 'idle';

        state.detailsRequestId =
          null;

        state.listErrors.details =
          null;

        state.error =
          null;
      },

      // ========================================================
      // CLEAR PRODUCT DETAILS
      // ========================================================

      clearProductDetails: (
        state,
      ) => {
        state.productDetails =
          null;

        state.selectedProduct =
          null;

        state.detailsLoading =
          false;

        state.detailsStatus =
          'idle';

        state.detailsRequestId =
          null;

        state.listErrors.details =
          null;
      },

      // ========================================================
      // CLEAR ERROR
      // ========================================================

      clearError: (
        state,
      ) => {
        state.error =
          null;

        state.listErrors = {
          products: null,
          bestSellers: null,
          featured: null,
          discounted: null,
          newest: null,
          details: null,
        };
      },

      // ========================================================
      // RESET HOME REQUEST STATES
      // ========================================================

      /*
       * فقط وقتی واقعاً نیاز داریم Home را Force Refresh کنیم.
       *
       * مثلاً بعداً برای Refresh دستی یا Logout/Login.
       */
      resetHomeProductRequests: (
        state,
      ) => {
        if (
          !state.bestSellersLoading
        ) {
          state.bestSellersStatus =
            'idle';
        }

        if (
          !state.featuredLoading
        ) {
          state.featuredStatus =
            'idle';
        }

        if (
          !state.discountedLoading
        ) {
          state.discountedStatus =
            'idle';
        }

        if (
          !state.newestLoading
        ) {
          state.newestStatus =
            'idle';
        }
      },
    },

    extraReducers: (
      builder,
    ) => {
      // ========================================================
      // ERROR HELPER
      // ========================================================

      const setError = (
        state: ProductState,
        key:
          keyof ProductListErrors,
        message:
          | unknown
          | undefined,
        fallback: string,
      ) => {
        const errorMessage =
          typeof message ===
            'string' &&
          message.trim()
            ? message
            : fallback;

        state.listErrors[key] =
          errorMessage;

        state.error =
          errorMessage;
      };

      // ========================================================
      // GET ALL PRODUCTS
      // ========================================================

      builder
        .addCase(
          getAllProducts.pending,
          (
            state,
            action,
          ) => {
            state.productsStatus =
              'loading';

            state.productsRequestId =
              action.meta.requestId;

            state.loading =
              true;

            state.listErrors.products =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getAllProducts.fulfilled,
          (
            state,
            action,
          ) => {
            /*
             * اگر Request قدیمی دیرتر برگشت،
             * نباید نتیجه Request جدید را overwrite کند.
             */
            if (
              state.productsRequestId &&
              state.productsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.productsStatus =
              'succeeded';

            state.productsRequestId =
              null;

            state.loading =
              false;

            state.products =
              action.payload as PagedResult<Product>;

            state.listErrors.products =
              null;
          },
        )

        .addCase(
          getAllProducts.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.productsRequestId &&
              state.productsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.productsRequestId =
              null;

            state.loading =
              false;

            if (
              action.meta.aborted
            ) {
              state.productsStatus =
                state.products
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.productsStatus =
              'failed';

            setError(
              state,
              'products',
              action.payload,
              'خطا در دریافت محصولات',
            );
          },
        );

      // ========================================================
      // BEST SELLERS
      // ========================================================

      builder
        .addCase(
          getBestSellingProducts.pending,
          (
            state,
            action,
          ) => {
            state.bestSellersStatus =
              'loading';

            state.bestSellersRequestId =
              action.meta.requestId;

            state.bestSellersLoading =
              true;

            state.listErrors.bestSellers =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getBestSellingProducts.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.bestSellersRequestId &&
              state.bestSellersRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.bestSellersStatus =
              'succeeded';

            state.bestSellersRequestId =
              null;

            state.bestSellersLoading =
              false;

            state.bestSellers =
              action.payload as PagedResult<Product>;

            state.listErrors.bestSellers =
              null;
          },
        )

        .addCase(
          getBestSellingProducts.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.bestSellersRequestId &&
              state.bestSellersRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.bestSellersRequestId =
              null;

            state.bestSellersLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.bestSellersStatus =
                state.bestSellers
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.bestSellersStatus =
              'failed';

            setError(
              state,
              'bestSellers',
              action.payload,
              'خطا در دریافت پرفروش‌ترین محصولات',
            );
          },
        );

      // ========================================================
      // FEATURED PRODUCTS
      // ========================================================

      builder
        .addCase(
          getFeaturedProductsPaged.pending,
          (
            state,
            action,
          ) => {
            state.featuredStatus =
              'loading';

            state.featuredRequestId =
              action.meta.requestId;

            state.featuredLoading =
              true;

            state.listErrors.featured =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getFeaturedProductsPaged.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.featuredRequestId &&
              state.featuredRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.featuredStatus =
              'succeeded';

            state.featuredRequestId =
              null;

            state.featuredLoading =
              false;

            state.featuredProducts =
              action.payload as PagedResult<Product>;

            state.listErrors.featured =
              null;
          },
        )

        .addCase(
          getFeaturedProductsPaged.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.featuredRequestId &&
              state.featuredRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.featuredRequestId =
              null;

            state.featuredLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.featuredStatus =
                state.featuredProducts
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.featuredStatus =
              'failed';

            setError(
              state,
              'featured',
              action.payload,
              'خطا در دریافت محصولات ویژه',
            );
          },
        );

      // ========================================================
      // NEWEST PRODUCTS
      // ========================================================

      builder
        .addCase(
          getNewestProductsPaged.pending,
          (
            state,
            action,
          ) => {
            state.newestStatus =
              'loading';

            state.newestRequestId =
              action.meta.requestId;

            state.newestLoading =
              true;

            state.listErrors.newest =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getNewestProductsPaged.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.newestRequestId &&
              state.newestRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.newestStatus =
              'succeeded';

            state.newestRequestId =
              null;

            state.newestLoading =
              false;

            state.newestProducts =
              action.payload as PagedResult<Product>;

            state.listErrors.newest =
              null;
          },
        )

        .addCase(
          getNewestProductsPaged.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.newestRequestId &&
              state.newestRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.newestRequestId =
              null;

            state.newestLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.newestStatus =
                state.newestProducts
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.newestStatus =
              'failed';

            setError(
              state,
              'newest',
              action.payload,
              'خطا در دریافت جدیدترین محصولات',
            );
          },
        );

      // ========================================================
      // DISCOUNTED PRODUCTS
      // ========================================================

      builder
        .addCase(
          getDiscountedProductsPaged.pending,
          (
            state,
            action,
          ) => {
            state.discountedStatus =
              'loading';

            state.discountedRequestId =
              action.meta.requestId;

            state.discountedLoading =
              true;

            state.listErrors.discounted =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getDiscountedProductsPaged.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.discountedRequestId &&
              state.discountedRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.discountedStatus =
              'succeeded';

            state.discountedRequestId =
              null;

            state.discountedLoading =
              false;

            state.discountedProducts =
              action.payload as PagedResult<Product>;

            state.listErrors.discounted =
              null;
          },
        )

        .addCase(
          getDiscountedProductsPaged.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.discountedRequestId &&
              state.discountedRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.discountedRequestId =
              null;

            state.discountedLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.discountedStatus =
                state.discountedProducts
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.discountedStatus =
              'failed';

            setError(
              state,
              'discounted',
              action.payload,
              'خطا در دریافت محصولات تخفیف‌دار',
            );
          },
        );

      // ========================================================
      // GET PRODUCT BY SLUG
      // ========================================================

      builder
        .addCase(
          getProductBySlug.pending,
          (
            state,
            action,
          ) => {
            state.detailsStatus =
              'loading';

            state.detailsRequestId =
              action.meta.requestId;

            state.detailsLoading =
              true;

            state.productDetails =
              null;

            state.listErrors.details =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getProductBySlug.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.detailsRequestId &&
              state.detailsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.detailsRequestId =
              null;

            state.detailsLoading =
              false;

            state.detailsStatus =
              'succeeded';

            state.productDetails =
              action.payload as ProductDetails;

            state.listErrors.details =
              null;
          },
        )

        .addCase(
          getProductBySlug.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.detailsRequestId &&
              state.detailsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.detailsRequestId =
              null;

            state.detailsLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.detailsStatus =
                state.productDetails
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.detailsStatus =
              'failed';

            setError(
              state,
              'details',
              action.payload,
              'خطا در دریافت اطلاعات محصول',
            );
          },
        );

      // ========================================================
      // GET PRODUCT DETAILS BY ID
      // ========================================================

      builder
        .addCase(
          getProductDetails.pending,
          (
            state,
            action,
          ) => {
            state.detailsStatus =
              'loading';

            state.detailsRequestId =
              action.meta.requestId;

            state.detailsLoading =
              true;

            state.productDetails =
              null;

            state.listErrors.details =
              null;

            state.error =
              null;
          },
        )

        .addCase(
          getProductDetails.fulfilled,
          (
            state,
            action,
          ) => {
            if (
              state.detailsRequestId &&
              state.detailsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.detailsRequestId =
              null;

            state.detailsLoading =
              false;

            state.detailsStatus =
              'succeeded';

            state.productDetails =
              action.payload as ProductDetails;

            state.listErrors.details =
              null;
          },
        )

        .addCase(
          getProductDetails.rejected,
          (
            state,
            action,
          ) => {
            if (
              state.detailsRequestId &&
              state.detailsRequestId !==
                action.meta.requestId
            ) {
              return;
            }

            state.detailsRequestId =
              null;

            state.detailsLoading =
              false;

            if (
              action.meta.aborted
            ) {
              state.detailsStatus =
                state.productDetails
                  ? 'succeeded'
                  : 'idle';

              return;
            }

            state.detailsStatus =
              'failed';

            setError(
              state,
              'details',
              action.payload,
              'خطا در دریافت جزئیات محصول',
            );
          },
        );

      // ========================================================
      // PDP ADDITIONAL DATA
      // ========================================================

      builder
        .addCase(
          fetchPDPAdditionalData.pending,
          (
            state,
          ) => {
            /*
             * عمداً detailsLoading را true نمی‌کنیم.
             *
             * چون صفحه اصلی Product Details ممکن است
             * قبلاً Load شده باشد و فقط Bundle / Price
             * در حال دریافت باشد.
             */
          },
        )

        .addCase(
          fetchPDPAdditionalData.fulfilled,
          (
            state,
            action,
          ) => {
            state.bundles =
              action.payload
                ?.bundles ??
              [];

            state.effectivePrice =
              action.payload
                ?.effectivePrice ??
              null;
          },
        )

        .addCase(
          fetchPDPAdditionalData.rejected,
          (
            state,
            action,
          ) => {
            /*
             * خطای Additional Data نباید کل PDP را
             * وارد حالت failed کند.
             */
            if (
              action.meta.aborted
            ) {
              return;
            }

            if (
              typeof action.payload ===
                'string' &&
              action.payload
            ) {
              state.error =
                action.payload;
            }
          },
        );
    },
  });

// ============================================================
// ACTIONS
// ============================================================

export const {
  setSelectedProduct,
  setProductDetails,
  clearProductDetails,
  clearError,
  resetHomeProductRequests,
} =
  productSlice.actions;

// ============================================================
// REDUCER
// ============================================================

export default productSlice.reducer;