import axiosClient from '@/services/api/common/axiosClient';
import { getCachedRequest } from '@/services/api/common/requestCache';

const REFERENCE_DATA_TTL_MS =
  5 * 60_000;

export interface ShippingQuoteRequest {
  cartId: number;
  userAddressId: number;
  shippingMethod: string;
}

export interface ShippingQuoteResponse {
  shippingMethodId: number;
  shippingMethodCode: string;
  shippingMethodName: string;
  shippingCost: number;
  totalWeightKg: number;
  estimatedDeliveryDays: number;
}

interface ShippingQuoteOperationResult {
  isSuccess: boolean;
  message?: string;
  errors?: unknown;
  data?: ShippingQuoteResponse;
}

export const CheckoutReferenceApi = {
  /*
   * لیست روش‌های ارسال.
   *
   * این Endpoint فقط روش‌ها را برمی‌گرداند.
   * مبلغ نهایی Checkout از اینجا گرفته نمی‌شود.
   */
  getShippingMethods: () =>
    getCachedRequest(
      'checkout:shipping-methods',
      () =>
        axiosClient.get(
          '/ShippingMethod/GetAll',
        ),
      REFERENCE_DATA_TTL_MS,
    ),

  /*
   * روش‌های پرداخت.
   */
  getPaymentMethods: () =>
    getCachedRequest(
      'checkout:payment-methods',
      () =>
        axiosClient.get(
          '/PaymentMethod',
        ),
      REFERENCE_DATA_TTL_MS,
    ),

  /*
   * ==========================================================
   * SHIPPING QUOTE
   * ==========================================================
   *
   * این درخواست Cache نمی‌شود.
   *
   * چون مبلغ ارسال می‌تواند با تغییر:
   *
   * - Cart
   * - تعداد کالا
   * - وزن
   * - Address
   * - Shipping Method
   *
   * عوض شود.
   *
   * Frontend فقط این سه مقدار را می‌فرستد:
   *
   * cartId
   * userAddressId
   * shippingMethod
   *
   * وزن، شهر، استان، کدپستی و مبلغ سفارش
   * توسط Backend استخراج می‌شوند.
   */
  getShippingQuote: (
    request: ShippingQuoteRequest,
  ) =>
    axiosClient.post<
      ShippingQuoteOperationResult
    >(
      '/Shipping/quote',
      request,
    ),
};