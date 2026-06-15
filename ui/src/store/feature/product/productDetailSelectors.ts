import { RootState } from '@/store';

// نظرات
export const selectProductReviews = (state: RootState) => state.productDetail.reviews;
export const selectReviewsLoading = (state: RootState) => state.productDetail.reviewsLoading;
export const selectReviewSubmitting = (state: RootState) => state.productDetail.reviewSubmitting;
export const selectReviewsPagination = (state: RootState) => state.productDetail.reviewsPagination;
export const selectAverageRating = (state: RootState) => state.productDetail.averageRating;

// پرسش و پاسخ
export const selectProductQuestions = (state: RootState) => state.productDetail.questions;
export const selectQuestionsLoading = (state: RootState) => state.productDetail.questionsLoading;
export const selectQuestionSubmitting = (state: RootState) => state.productDetail.questionSubmitting;
export const selectQuestionsPagination = (state: RootState) => state.productDetail.questionsPagination;

// محصولات مرتبط
export const selectRelatedProducts = (state: RootState) => state.productDetail.relatedProducts;
export const selectRelatedLoading = (state: RootState) => state.productDetail.relatedLoading;

// خطا
export const selectProductDetailError = (state: RootState) => state.productDetail.error;