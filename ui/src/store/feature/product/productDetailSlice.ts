import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type {
  ProductQuestion,
} from '@/features/product/api/productQuestionApi';
import type {
  RelatedProductsResponse,
} from '@/features/product/api/productRelatedApi';
import type {
  Review,
} from '@/features/product/api/productReviewApi';
import type {
  ProductBundleDto,
} from '@/models/ProductBundle/ProductBundle';

import {
  createQuestion,
  fetchProductQuestions,
} from './productQuestionThunks';
import {
  fetchRelatedProducts,
} from './productRelatedThunks';
import {
  createReview,
  fetchProductReviews,
  markReviewHelpful,
} from './productReviewThunks';
import {
  fetchEffectivePrice,
  fetchProductBundles,
} from './productThunks';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

export interface ProductDetailState {
  currentProductId: number | null;

  reviews: Review[];
  reviewsPagination: PaginationState;
  averageRating: number;
  reviewsLoading: boolean;
  reviewsLoaded: boolean;
  reviewsProductId: number | null;
  reviewSubmitting: boolean;

  questions: ProductQuestion[];
  questionsPagination: PaginationState;
  questionsLoading: boolean;
  questionsLoaded: boolean;
  questionsProductId: number | null;
  questionSubmitting: boolean;

  relatedProducts: RelatedProductsResponse | null;
  relatedLoading: boolean;
  relatedLoaded: boolean;
  relatedProductId: number | null;

  bundles: ProductBundleDto[];
  bundlesLoading: boolean;
  bundlesLoaded: boolean;
  bundlesProductId: number | null;

  effectivePrice: number | null;
  effectivePriceLoading: boolean;
  effectivePriceLoaded: boolean;
  effectivePriceProductId: number | null;

  error: string | null;
}

const defaultPagination = (): PaginationState => ({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10,
});

const createInitialState = (
  productId: number | null = null,
): ProductDetailState => ({
  currentProductId: productId,

  reviews: [],
  reviewsPagination: defaultPagination(),
  averageRating: 0,
  reviewsLoading: false,
  reviewsLoaded: false,
  reviewsProductId: null,
  reviewSubmitting: false,

  questions: [],
  questionsPagination: defaultPagination(),
  questionsLoading: false,
  questionsLoaded: false,
  questionsProductId: null,
  questionSubmitting: false,

  relatedProducts: null,
  relatedLoading: false,
  relatedLoaded: false,
  relatedProductId: null,

  bundles: [],
  bundlesLoading: false,
  bundlesLoaded: false,
  bundlesProductId: null,

  effectivePrice: null,
  effectivePriceLoading: false,
  effectivePriceLoaded: false,
  effectivePriceProductId: null,

  error: null,
});

const productDetailSlice = createSlice({
  name: 'productDetail',
  initialState: createInitialState(),
  reducers: {
    initializeProductDetail: (
      state,
      action: PayloadAction<number>,
    ) => {
      if (
        state.currentProductId === action.payload
      ) {
        return;
      }

      return createInitialState(action.payload);
    },

    clearProductDetailError: (state) => {
      state.error = null;
    },

    clearProductDetail: () =>
      createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchProductReviews.pending,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          if (
            state.reviewsProductId !== productId
          ) {
            state.reviews = [];
            state.reviewsPagination =
              defaultPagination();
            state.averageRating = 0;
          }

          state.reviewsProductId = productId;
          state.reviewsLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchProductReviews.fulfilled,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.reviewsLoading = false;
          state.reviewsLoaded = true;
          state.reviewsProductId = productId;
          state.reviews = action.payload.reviews;
          state.reviewsPagination = {
            currentPage:
              action.payload.currentPage,
            totalPages:
              action.payload.totalPages,
            totalCount:
              action.payload.totalCount,
            pageSize: action.payload.pageSize,
          };
          state.averageRating =
            action.payload.averageRating;
        },
      )
      .addCase(
        fetchProductReviews.rejected,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.reviewsLoading = false;
          state.error =
            action.payload ||
            'خطا در دریافت نظرات';
        },
      );

    builder
      .addCase(createReview.pending, (state) => {
        state.reviewSubmitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.reviewSubmitting = false;
      })
      .addCase(
        createReview.rejected,
        (state, action) => {
          state.reviewSubmitting = false;
          state.error =
            action.payload ||
            'خطا در ثبت نظر';
        },
      )
      .addCase(
        markReviewHelpful.fulfilled,
        (state, action) => {
          const review = state.reviews.find(
            (item) =>
              item.productReviewId ===
              action.payload.reviewId,
          );

          if (review) {
            review.helpfulCount =
              (review.helpfulCount || 0) + 1;
          }
        },
      );

    builder
      .addCase(
        fetchProductQuestions.pending,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          if (
            state.questionsProductId !== productId
          ) {
            state.questions = [];
            state.questionsPagination =
              defaultPagination();
          }

          state.questionsProductId = productId;
          state.questionsLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchProductQuestions.fulfilled,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.questionsLoading = false;
          state.questionsLoaded = true;
          state.questionsProductId = productId;
          state.questions = action.payload.questions;
          state.questionsPagination = {
            currentPage:
              action.payload.currentPage,
            totalPages:
              action.payload.totalPages,
            totalCount:
              action.payload.totalCount,
            pageSize: action.payload.pageSize,
          };
        },
      )
      .addCase(
        fetchProductQuestions.rejected,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.questionsLoading = false;
          state.error =
            action.payload ||
            'خطا در دریافت پرسش‌ها';
        },
      );

    builder
      .addCase(createQuestion.pending, (state) => {
        state.questionSubmitting = true;
        state.error = null;
      })
      .addCase(
        createQuestion.fulfilled,
        (state) => {
          state.questionSubmitting = false;
        },
      )
      .addCase(
        createQuestion.rejected,
        (state, action) => {
          state.questionSubmitting = false;
          state.error =
            action.payload ||
            'خطا در ثبت پرسش';
        },
      );

    builder
      .addCase(
        fetchRelatedProducts.pending,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.relatedProductId = productId;
          state.relatedLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchRelatedProducts.fulfilled,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.relatedLoading = false;
          state.relatedLoaded = true;
          state.relatedProductId = productId;
          state.relatedProducts = action.payload;
        },
      )
      .addCase(
        fetchRelatedProducts.rejected,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.relatedLoading = false;
          state.error =
            action.payload ||
            'خطا در دریافت محصولات مرتبط';
        },
      );

    builder
      .addCase(
        fetchEffectivePrice.pending,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.effectivePriceProductId =
            productId;
          state.effectivePriceLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchEffectivePrice.fulfilled,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.effectivePriceLoading = false;
          state.effectivePriceLoaded = true;
          state.effectivePriceProductId =
            productId;
          state.effectivePrice = action.payload;
        },
      )
      .addCase(
        fetchEffectivePrice.rejected,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.effectivePriceLoading = false;
          state.error =
            action.payload ||
            'خطا در دریافت قیمت محصول';
        },
      );

    builder
      .addCase(
        fetchProductBundles.pending,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.bundlesProductId = productId;
          state.bundlesLoading = true;
          state.error = null;
        },
      )
      .addCase(
        fetchProductBundles.fulfilled,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.bundlesLoading = false;
          state.bundlesLoaded = true;
          state.bundlesProductId = productId;
          state.bundles = action.payload;
        },
      )
      .addCase(
        fetchProductBundles.rejected,
        (state, action) => {
          const { productId } = action.meta.arg;

          if (
            state.currentProductId !== productId
          ) {
            return;
          }

          state.bundlesLoading = false;
          state.error =
            action.payload ||
            'خطا در دریافت بسته‌های محصول';
        },
      );
  },
});

export const {
  initializeProductDetail,
  clearProductDetailError,
  clearProductDetail,
} = productDetailSlice.actions;

export default productDetailSlice.reducer;
