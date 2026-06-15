// features/product/api/productFilterApi.ts

import axiosInstance from '@/services/api/common/axiosInstance';

export interface ProductFilterParams {
  categoryId?: number;
  brandId?: number;
  vehicleIds?: { makeId: number; modelId: number }[]; // ✅ آرایه خودروها
  makeId?: number;      // برای سازگاری با عقب
  modelId?: number;     // برای سازگاری با عقب
  trimId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  sortBy?: 'newest' | 'cheapest' | 'expensive' | 'discounted' | 'featured' | 'bestsellers';
  page?: number;
  pageSize?: number;
}

export const productFilterApi = {
  getFilteredProducts: async (params: ProductFilterParams) => {
    const queryParams: any = { ...params };
    
    // تبدیل vehicleIds به رشته
    if (params.vehicleIds && params.vehicleIds.length > 0) {
      queryParams.vehicleIds = params.vehicleIds
        .map(v => `${v.makeId}-${v.modelId}`)
        .join(',');
      // حذف آرایه اصلی
      delete queryParams.vehicleIds;
    }
    
    // حذف فیلدهای undefined
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === null) {
        delete queryParams[key];
      }
    });
    
    return await axiosInstance.get('/Product/filtered', { params: queryParams });
  },
};