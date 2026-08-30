// services/api/product/productFilterApi.ts

import type { AxiosResponse } from 'axios';

import axiosClient from '@/services/api/common/axiosClient';

import {
  createProductFilterRequestKey,
  normalizeProductFilters,
  type ProductFilterParams,
} from '@/models/product/ProductFilters';

export interface ProductFilterApiEnvelope {
  isSuccess?: boolean;
  message?: string;
  data?: unknown;
  mainResults?: unknown;
}

const FILTER_RESULT_TTL_MS = 15_000;
const MAX_FILTER_CACHE_ENTRIES = 30;

type FilterCacheEntry = {
  response: AxiosResponse<ProductFilterApiEnvelope>;
  expiresAt: number;
};

const filterResultCache = new Map<string, FilterCacheEntry>();

const pruneFilterCache = () => {
  const now = Date.now();
  for (const [key, entry] of filterResultCache) {
    if (entry.expiresAt <= now) filterResultCache.delete(key);
  }

  while (filterResultCache.size > MAX_FILTER_CACHE_ENTRIES) {
    const oldest = filterResultCache.keys().next().value as string | undefined;
    if (!oldest) break;
    filterResultCache.delete(oldest);
  }
};

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
  getFilteredProducts: async (
    params: ProductFilterParams,
    signal?: AbortSignal,
  ): Promise<AxiosResponse<ProductFilterApiEnvelope>> => {
    pruneFilterCache();

    const normalized = normalizeProductFilters(params);
    const key = createProductFilterRequestKey(normalized);
    const cached = filterResultCache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      // لمس entry برای LRU سبک.
      filterResultCache.delete(key);
      filterResultCache.set(key, cached);
      return cached.response;
    }

    const response = await axiosClient.get<ProductFilterApiEnvelope>(
      '/Product/filtered',
      {
        params: serializeFilterParams(normalized),
        signal,
      },
    );

    if (response.data.isSuccess !== false) {
      filterResultCache.set(key, {
        response,
        expiresAt: Date.now() + FILTER_RESULT_TTL_MS,
      });
      pruneFilterCache();
    }

    return response;
  },

  clearCache: () => filterResultCache.clear(),
};
