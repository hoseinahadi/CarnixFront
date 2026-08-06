import type { OperationResult } from '@/models/common/OperationResult';
import axiosClient from '@/services/api/common/axiosClient';

export interface CreateReviewRequest {
  productId: number;
  title?: string;
  content: string;
  rating: number;
}

export interface ReviewStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  averageRating: number;
  totalHelpfulVotes: number;
  verifiedPurchases: number;
}

export interface Review {
  productReviewId: number;
  productId: number;
  userId: number;
  title: string;
  content: string;
  rating: number;
  helpfulCount: number;
  createdAt: string;
  isVerifiedPurchase: boolean;
  reviewStatus: string;
  userName?: string;
  productName?: string;
  productSlug?: string;
}

export interface PaginatedReviewsResponse {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

function validateReview(data: CreateReviewRequest): void {
  if (!data.productId) {
    throw new Error('شناسه محصول الزامی است.');
  }

  if (!data.content?.trim()) {
    throw new Error('متن نظر الزامی است.');
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error('امتیاز باید بین ۱ تا ۵ باشد.');
  }
}

export const productReviewApi = {
  getProductReviews: (
    productId: number,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
      `/ProductReview/product/${productId}`,
      {
        params: {
          page,
          pageSize,
        },
      },
    ),

  getUserReviews: (
    userId: number,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
      `/ProductReview/user/${userId}`,
      {
        params: {
          page,
          pageSize,
        },
      },
    ),

  getMyReviews: (
    page: number = 1,
    pageSize: number = 10,
  ) =>
    axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
      '/ProductReview/user/me',
      {
        params: {
          page,
          pageSize,
        },
      },
    ),

  getMyReviewStats: () =>
    axiosClient.get<OperationResult<ReviewStats>>(
      '/ProductReview/user/me/stats',
    ),

  createReview: (data: CreateReviewRequest) => {
    validateReview(data);

    return axiosClient.post<OperationResult<Review>>(
      '/ProductReview/create',
      {
        productId: data.productId,
        title: data.title?.trim() || '',
        content: data.content.trim(),
        rating: data.rating,
      },
    );
  },

  markHelpful: (reviewId: number) =>
    axiosClient.post<OperationResult<null>>(
      `/ProductReview/${reviewId}/helpful`,
    ),

  deleteReview: (reviewId: number) =>
    axiosClient.delete<OperationResult<null>>(
      `/ProductReview/${reviewId}`,
    ),

  updateReview: (
    reviewId: number,
    data: Partial<CreateReviewRequest>,
  ) =>
    axiosClient.put<OperationResult<Review>>(
      `/ProductReview/${reviewId}`,
      data,
    ),

  reportReview: (
    reviewId: number,
    reason: string,
  ) =>
    axiosClient.post<OperationResult<null>>(
      `/ProductReview/${reviewId}/report`,
      {
        reason: reason.trim(),
      },
    ),
};

export default productReviewApi;
