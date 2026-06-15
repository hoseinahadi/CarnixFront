import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchProductReviews, createReview, markReviewHelpful } from './productReviewThunks';
import { fetchProductQuestions, createQuestion } from './productQuestionThunks';
import { fetchRelatedProducts } from './productRelatedThunks';

interface ProductDetailState {
  // نظرات
  reviews: any[];
  reviewsPagination: { currentPage: number; totalPages: number; totalCount: number; pageSize: number };
  averageRating: number;
  reviewsLoading: boolean;
  reviewSubmitting: boolean;
  
  // پرسش و پاسخ
  questions: any[];
  questionsPagination: { currentPage: number; totalPages: number; totalCount: number; pageSize: number };
  questionsLoading: boolean;
  questionSubmitting: boolean;
  
  // محصولات مرتبط
  relatedProducts: any;
  relatedLoading: boolean;
  
  // خطاها
  error: string | null;
}

const initialState: ProductDetailState = {
  reviews: [],
  reviewsPagination: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
  averageRating: 0,
  reviewsLoading: false,
  reviewSubmitting: false,
  
  questions: [],
  questionsPagination: { currentPage: 1, totalPages: 1, totalCount: 0, pageSize: 10 },
  questionsLoading: false,
  questionSubmitting: false,
  
  relatedProducts: null,
  relatedLoading: false,
  
  error: null,
};

const productDetailSlice = createSlice({
  name: 'productDetail',
  initialState,
  reducers: {
    clearProductDetailError: (state) => {
      state.error = null;
    },
    clearProductDetail: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch Reviews ───
    builder
      .addCase(fetchProductReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = action.payload.reviews;
        state.reviewsPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          pageSize: action.payload.pageSize,
        };
        state.averageRating = action.payload.averageRating;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.error = action.payload as string;
      });

    // ─── Create Review ───
    builder
      .addCase(createReview.pending, (state) => {
        state.reviewSubmitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state) => {
        state.reviewSubmitting = false;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.reviewSubmitting = false;
        state.error = action.payload as string;
      });

    // ─── Mark Helpful ───
    builder
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r.productReviewId === action.payload.reviewId);
        if (review) {
          review.helpfulCount = (review.helpfulCount || 0) + 1;
        }
      });

    // ─── Fetch Questions ───
    builder
      .addCase(fetchProductQuestions.pending, (state) => {
        state.questionsLoading = true;
        state.error = null;
      })
      .addCase(fetchProductQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.questions = action.payload.questions;
        state.questionsPagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalCount: action.payload.totalCount,
          pageSize: action.payload.pageSize,
        };
      })
      .addCase(fetchProductQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.error = action.payload as string;
      });

    // ─── Create Question ───
    builder
      .addCase(createQuestion.pending, (state) => {
        state.questionSubmitting = true;
        state.error = null;
      })
      .addCase(createQuestion.fulfilled, (state) => {
        state.questionSubmitting = false;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.questionSubmitting = false;
        state.error = action.payload as string;
      });

    // ─── Fetch Related ───
    builder
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.relatedLoading = true;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedLoading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.relatedLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProductDetailError, clearProductDetail } = productDetailSlice.actions;
export default productDetailSlice.reducer;