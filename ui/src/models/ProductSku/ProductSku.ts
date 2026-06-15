export interface ProductSkuSimple {
    skuId: number;
    skuCode: string;
    price: number;
    stockQuantity: number;
    colorName?: string;
    sizeName?: string;
}