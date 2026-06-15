// models/product/ProductFilters.ts

export interface ProductFilters {
  // فیلترهای اصلی
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
  
  // 🆕 فیلترهای موجودی و تخفیف
  inStock?: boolean;
  hasDiscount?: boolean;
  
  // 🆕 فیلترهای خودرو
  makeId?: number;
  modelId?: number;
  
  // 🆕 فیلترهای اضافی (برای توسعه آینده)
  searchTerm?: string;
  supplierId?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}

// 🆕 تعریف نوع برای مرتب‌سازی
export type SortOption = 
  | 'newest' 
  | 'cheapest' 
  | 'expensive' 
  | 'discounted' 
  | 'mostSold'
  | 'highestRated';

// 🆕 مقادیر پیش‌فرض برای فیلترها
export const DEFAULT_FILTERS: ProductFilters = {
  page: 1,
  pageSize: 20,
  sortBy: 'newest',
  inStock: undefined,
  hasDiscount: undefined,
  makeId: undefined,
  modelId: undefined,
  categoryId: undefined,
  brandId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
};

// 🆕 تابع کمکی برای تبدیل فیلترها به Query String
export const filtersToQueryString = (filters: ProductFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return params.toString();
};

// 🆕 تابع کمکی برای تبدیل Query String به فیلترها
export const queryStringToFilters = (queryString: string): ProductFilters => {
  const params = new URLSearchParams(queryString);
  const filters: ProductFilters = {};
  
  params.forEach((value, key) => {
    if (key === 'page' || key === 'pageSize' || key === 'categoryId' || 
        key === 'brandId' || key === 'makeId' || key === 'modelId') {
      filters[key] = Number(value);
    } else if (key === 'minPrice' || key === 'maxPrice') {
      filters[key] = Number(value);
    } else if (key === 'inStock' || key === 'hasDiscount' || key === 'isFeatured' || key === 'isActive') {
      filters[key ] = value === 'true';
    } else {
      filters[key] = value;
    }
  });
  
  return filters;
};