export interface ProductDiscount {
  productDiscountId: number | string;
  title: string;
  description: number | string;
  discountType: boolean;
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minimumPurchaseAmount: string;
  maxUsageCount: number;
  currentUsageCount: number;
  productId: number;
  
  
  
  
}
