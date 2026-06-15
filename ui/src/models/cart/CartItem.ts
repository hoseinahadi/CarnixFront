// src/models/cart/CartItem.ts

import { Product } from "../product/Product";

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  
  // محاسبه قیمت کل این سطر: $$TotalPrice = (Quantity \times UnitPrice) - DiscountAmount$$
  totalPrice: number;
  
  // اطلاعات محصول که از سمت بک‌اند Join شده است
  product: Product;
}
