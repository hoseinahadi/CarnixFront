// src/models/order/OrderDto.ts
export interface OrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string;
}

export interface OrderDto {
  orderId: number;
  orderNumber: string;
  orderDate: string;
  createdAt: string;
  orderStatusId: number; // این همان آیدی است که وضعیت را مشخص می‌کند
  orderStatus: string;   // متن وضعیت (مثلاً "تکمیل شده")
  grandTotal: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  items: OrderItemDto[];
  shipments?: {
    destinationAddress: string;
    trackingNumber?: string;
    shippingCost: number;
    shippingMethodId?: number;      // ⭐ اضافه شد
  shippingMethodCode?: string;    // ⭐ اضافه شد
  shippingMethodName?: string;    // ⭐ اضافه شد (اختیاری)
  }[];
}