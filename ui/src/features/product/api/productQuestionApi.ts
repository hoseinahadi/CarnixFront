import type { OperationResult } from '@/models/common/OperationResult';
import axiosClient from '@/services/api/common/axiosClient';

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

export const productQuestionApi = {
  getProductQuestions: (
    productId: number,
    page: number = 1,
    pageSize: number = 10,
  ) =>
    axiosClient.get<OperationResult<ProductQuestionsPage>>(
      `/ProductQuestion/product/${productId}`,
      {
        params: {
          page,
          pageSize,
        },
      },
    ),

  createQuestion: (data: CreateQuestionRequest) =>
    axiosClient.post<OperationResult<ProductQuestion>>(
      '/ProductQuestion/create',
      data,
    ),
};
