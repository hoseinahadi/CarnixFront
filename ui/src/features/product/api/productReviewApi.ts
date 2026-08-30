import type { OperationResult } from '@/models/common/OperationResult';
import axiosClient from '@/services/api/common/axiosClient';
import {
  getCachedRequest,
  invalidateRequestCache,
} from '@/services/api/common/requestCache';

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

const PUBLIC_REVIEWS_TTL_MS = 60_000;
const MY_REVIEWS_TTL_MS = 30_000;

const productReviewPrefix = (productId: number): string =>
  `reviews:product:${productId}:`;

export const invalidateProductReviewCache = (productId?: number): void => {
  invalidateRequestCache(
    productId == null ? 'reviews:product:' : productReviewPrefix(productId),
  );
};

export const invalidateMyReviewCache = (): void => {
  invalidateRequestCache('reviews:me:');
};

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
    getCachedRequest(
      `${productReviewPrefix(productId)}${page}:${pageSize}`,
      () =>
        axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
          `/ProductReview/product/${productId}`,
          {
            params: { page, pageSize },
          },
        ),
      PUBLIC_REVIEWS_TTL_MS,
    ),

  getUserReviews: (
    userId: number,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    getCachedRequest(
      `reviews:user:${userId}:${page}:${pageSize}`,
      () =>
        axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
          `/ProductReview/user/${userId}`,
          {
            params: { page, pageSize },
          },
        ),
      MY_REVIEWS_TTL_MS,
    ),

  getMyReviews: (
    page: number = 1,
    pageSize: number = 10,
  ) =>
    getCachedRequest(
      `reviews:me:list:${page}:${pageSize}`,
      () =>
        axiosClient.get<OperationResult<PaginatedReviewsResponse>>(
          '/ProductReview/user/me',
          {
            params: { page, pageSize },
          },
        ),
      MY_REVIEWS_TTL_MS,
    ),

  getMyReviewStats: () =>
    getCachedRequest(
      'reviews:me:stats',
      () =>
        axiosClient.get<OperationResult<ReviewStats>>(
          '/ProductReview/user/me/stats',
        ),
      MY_REVIEWS_TTL_MS,
    ),

  createReview: async (data: CreateReviewRequest) => {
    validateReview(data);

    const response = await axiosClient.post<OperationResult<Review>>(
      '/ProductReview/create',
      {
        productId: data.productId,
        title: data.title?.trim() || '',
        content: data.content.trim(),
        rating: data.rating,
      },
    );

    invalidateProductReviewCache(data.productId);
    invalidateMyReviewCache();
    return response;
  },

  markHelpful: async (reviewId: number) => {
    const response = await axiosClient.post<OperationResult<null>>(
      `/ProductReview/${reviewId}/helpful`,
    );

    // محصول دقیق از reviewId در API مشخص نیست؛ prefix عمومی امن‌تر است.
    invalidateProductReviewCache();
    return response;
  },

  deleteReview: async (reviewId: number) => {
    const response = await axiosClient.delete<OperationResult<null>>(
      `/ProductReview/${reviewId}`,
    );
    invalidateMyReviewCache();
    invalidateProductReviewCache();
    return response;
  },

  updateReview: async (
    reviewId: number,
    data: Partial<CreateReviewRequest>,
  ) => {
    const response = await axiosClient.put<OperationResult<Review>>(
      `/ProductReview/${reviewId}`,
      data,
    );
    invalidateMyReviewCache();
    invalidateProductReviewCache();
    return response;
  },

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
