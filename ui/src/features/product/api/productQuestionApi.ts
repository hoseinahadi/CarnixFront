import type { OperationResult } from '@/models/common/OperationResult';
import axiosClient from '@/services/api/common/axiosClient';
import {
  getCachedRequest,
  invalidateRequestCache,
} from '@/services/api/common/requestCache';

export interface CreateQuestionRequest {
  productId: number;
  questionText: string;
}

export interface ProductQuestionAnswer {
  productQuestionAnswerId?: number;
  answerText: string;
  isAdminReply: boolean;
  createdAt?: string;
  userName?: string;
}

export interface ProductQuestion {
  productQuestionId: number;
  productId: number;
  questionText: string;
  createdAt: string;
  userName?: string;
  answers?: ProductQuestionAnswer[];
}

export interface ProductQuestionsPage {
  questions: ProductQuestion[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}

const QUESTIONS_TTL_MS = 60_000;
const questionPrefix = (productId: number): string =>
  `questions:product:${productId}:`;

export const invalidateProductQuestionCache = (productId: number): void => {
  invalidateRequestCache(questionPrefix(productId));
};

export const productQuestionApi = {
  getProductQuestions: (
    productId: number,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    getCachedRequest(
      `${questionPrefix(productId)}${page}:${pageSize}`,
      () =>
        axiosClient.get<OperationResult<ProductQuestionsPage>>(
          `/ProductQuestion/product/${productId}`,
          {
            params: { page, pageSize },
          },
        ),
      QUESTIONS_TTL_MS,
    ),

  createQuestion: async (data: CreateQuestionRequest) => {
    const response = await axiosClient.post<OperationResult<ProductQuestion>>(
      '/ProductQuestion/create',
      data,
    );
    invalidateProductQuestionCache(data.productId);
    return response;
  },
};
