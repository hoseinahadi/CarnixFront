import axiosClient from '@/services/api/common/axiosClient';
import { getCachedRequest } from '@/services/api/common/requestCache';

const REFERENCE_DATA_TTL_MS = 5 * 60_000;

export const CheckoutReferenceApi = {
  getShippingMethods: () =>
    getCachedRequest(
      'checkout:shipping-methods',
      () => axiosClient.get('/ShippingMethod/GetAll'),
      REFERENCE_DATA_TTL_MS,
    ),

  getPaymentMethods: () =>
    getCachedRequest(
      'checkout:payment-methods',
      () => axiosClient.get('/PaymentMethod/GetAll'),
      REFERENCE_DATA_TTL_MS,
    ),
};
