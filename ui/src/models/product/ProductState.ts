import { PagedResult } from "../common/PagedResult";
import { Product } from "./Product";
import { ProductDetails } from "./ProductDetails";

export interface ProductState {
  products: Product[];
  bestSellers: PagedResult<Product> | null;
  
  // 🟢 موارد جدید اضافه شده
  featuredProducts: PagedResult<Product> | null;
  discountedProducts: PagedResult<Product> | null;
  
  selectedProduct: Product | null;
  productDetails: ProductDetails | null;
  
  loading: boolean;
  bestSellersLoading: boolean;
  
  // 🟢 وضعیت‌های لودینگ جدید
  featuredLoading: boolean;
  discountedLoading: boolean;
  
  detailsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}
