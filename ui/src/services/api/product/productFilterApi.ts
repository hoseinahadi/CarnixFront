// services/api/product/productFilterApi.ts

import axiosClient from '@/services/api/common/axiosClient';

import {
  normalizeProductFilters,
  type ProductFilterParams,
} from '@/models/product/ProductFilters';

export interface ProductFilterApiEnvelope {
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
  mainResults?: unknown;
}

const serializeFilterParams = (
  sourceParams: ProductFilterParams,
): Record<string, string | number | boolean> => {
  const params = normalizeProductFilters(sourceParams);
  const query: Record<string, string | number | boolean> = {};

  const assign = (
    key: string,
    value: string | number | boolean | undefined,
  ) => {
    if (value !== undefined && value !== '') {
      query[key] = value;
    }
  };

  assign('categoryId', params.categoryId);
  assign('brandId', params.brandId);
  assign('minPrice', params.minPrice);
  assign('maxPrice', params.maxPrice);
  assign('sortBy', params.sortBy);
  assign('page', params.page);
  assign('pageSize', params.pageSize);
  assign('inStock', params.inStock);
  assign('hasDiscount', params.hasDiscount);
  assign('isFeatured', params.isFeatured);
  assign('isActive', params.isActive);
  assign('makeId', params.makeId);
  assign('modelId', params.modelId);
  assign('trimId', params.trimId);
  assign('searchTerm', params.searchTerm);
  assign('supplierId', params.supplierId);

  if (params.vehicleIds && params.vehicleIds.length > 0) {
    query.vehicleIds = params.vehicleIds
      .map((vehicle) => {
        const base = `${vehicle.makeId}-${vehicle.modelId}`;
        return vehicle.trimId
          ? `${base}-${vehicle.trimId}`
          : base;
      })
      .join(',');
  }

  return query;
};

export const productFilterApi = {
  getFilteredProducts: (
    params: ProductFilterParams,
    signal?: AbortSignal,
  ) =>
    axiosClient.get<ProductFilterApiEnvelope>(
      '/Product/filtered',
      {
        params: serializeFilterParams(params),
        signal,
      },
    ),
};
