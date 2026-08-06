export interface ProductPriceHistoryDto {
  productPriceHistoryId: number;
  productId: number;
  oldPrice: number;
  newPrice: number;
  changeDate: string;
  modifiedById?: number;
}