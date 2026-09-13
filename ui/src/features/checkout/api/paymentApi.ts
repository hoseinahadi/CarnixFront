import axiosClient from '@/services/api/common/axiosClient';
import type { OperationResult } from '@/models/common/OperationResult';

export interface InitiatePaymentRequest { orderId: number; paymentMethodId: number; callbackUrl: string; }
export interface InitiatePaymentResult { paymentId: number; paymentUrl: string; gatewayToken?: string; }
export interface VerifyPaymentRequest { paymentId: number; transactionReference: string; gatewayToken: string; }

export const PaymentApi = {
  initiate: (request: InitiatePaymentRequest) => axiosClient.post<OperationResult<InitiatePaymentResult>>('/Payment/initiate', request),
  verify: (request: VerifyPaymentRequest) => axiosClient.post<OperationResult<{ orderId?: number }>>('/Payment/verify', request),
};
