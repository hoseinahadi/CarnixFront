// مسیر: src/models/product/ProductState.ts

import { PagedResult } from "../common/PagedResult";
import { Product } from "./Product";
import { ProductDetails } from "./ProductDetails";

export interface ProductState {
  products: Product[];
  bestSellers: PagedResult<Product> | null;
  effectivePrice: null;
  featuredProducts: PagedResult<Product> | null;
  discountedProducts: PagedResult<Product> | null;
  
  // 🟢 فیلدهای مربوط به جدیدترین محصولات
  newestProducts: PagedResult<Product> | null;
  newestLoading: boolean;

  relatedProducts: any[];
  selectedProduct: Product | null;
  productDetails: ProductDetails | null;
  
  loading: boolean;
  bestSellersLoading: boolean;
  bundles: any[];
  featuredLoading: boolean;
  discountedLoading: boolean;
  
  detailsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}