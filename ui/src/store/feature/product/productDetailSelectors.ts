import type { RootState } from '@/store';

export const selectCurrentProductDetailId = (
  state: RootState,
) => state.productDetail.currentProductId;

export const selectProductReviews = (
  state: RootState,
) => state.productDetail.reviews;

export const selectReviewsLoading = (
  state: RootState,
) => state.productDetail.reviewsLoading;

export const selectReviewsLoaded = (
  state: RootState,
) => state.productDetail.reviewsLoaded;

export const selectReviewsProductId = (
  state: RootState,
) => state.productDetail.reviewsProductId;

export const selectReviewSubmitting = (
  state: RootState,
) => state.productDetail.reviewSubmitting;

export const selectReviewsPagination = (
  state: RootState,
) => state.productDetail.reviewsPagination;

export const selectAverageRating = (
  state: RootState,
) => state.productDetail.averageRating;

export const selectProductQuestions = (
  state: RootState,
) => state.productDetail.questions;

export const selectQuestionsLoading = (
  state: RootState,
) => state.productDetail.questionsLoading;

export const selectQuestionsLoaded = (
  state: RootState,
) => state.productDetail.questionsLoaded;

export const selectQuestionsProductId = (
  state: RootState,
) => state.productDetail.questionsProductId;

export const selectQuestionSubmitting = (
  state: RootState,
) => state.productDetail.questionSubmitting;

export const selectQuestionsPagination = (
  state: RootState,
) => state.productDetail.questionsPagination;

export const selectRelatedProducts = (
  state: RootState,
) => state.productDetail.relatedProducts;

export const selectRelatedLoading = (
  state: RootState,
) => state.productDetail.relatedLoading;

export const selectRelatedLoaded = (
  state: RootState,
) => state.productDetail.relatedLoaded;

export const selectProductBundles = (
  state: RootState,
) => state.productDetail.bundles;

export const selectBundlesLoading = (
  state: RootState,
) => state.productDetail.bundlesLoading;

export const selectBundlesLoaded = (
  state: RootState,
) => state.productDetail.bundlesLoaded;

export const selectEffectivePrice = (
  state: RootState,
) => state.productDetail.effectivePrice;

export const selectEffectivePriceLoading = (
  state: RootState,
) => state.productDetail.effectivePriceLoading;

export const selectAdditionalDataLoading = (
  state: RootState,
) =>
  state.productDetail.effectivePriceLoading ||
  state.productDetail.bundlesLoading;

export const selectProductDetailError = (
  state: RootState,
) => state.productDetail.error;
