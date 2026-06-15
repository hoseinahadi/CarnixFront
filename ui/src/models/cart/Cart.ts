// src/models/cart/Cart.ts
import { CartItem } from "./CartItem";

export interface Cart {
  cartId: number;
  userId?: number | null;
  customerId?: number | null;
  status: string;
  
  subTotal: number;
  totalDiscount: number;
  taxAmount: number;
  
  // مبلغ نهایی قابل پرداخت: $$GrandTotal = SubTotal - TotalDiscount + TaxAmount$$
  grandTotal: number;
  
  items: CartItem[];
  totalItemsCount: number;
}
