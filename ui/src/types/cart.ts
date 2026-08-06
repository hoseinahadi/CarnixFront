export interface ICart {
  id: string | number;
  userId: string | number;
  items: ICartItem[];
  totalPrice: number;
  totalItemsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartItem {
  id: string | number;
  cartId: string | number;
  productId: string | number;
  quantity: number;
  price: number;
  product: IProductSummary;
}

// اگر مدل محصول را هم ندارید، این را اضافه کنید تا خطا ندهد
export interface IProductSummary {
  id: string | number;
  name: string;
  slug: string;
  mainImage?: string | null;
  price?: number;
}