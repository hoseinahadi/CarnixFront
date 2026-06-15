// store/feature/product/productFilterSelectors.ts

import { RootState } from '@/store';

export const selectFilteredProducts = (state: RootState) => state.productFilter.products;
export const selectFilteredLoading = (state: RootState) => state.productFilter.loading;
export const selectFilteredError = (state: RootState) => state.productFilter.error;
export const selectFilteredTotalCount = (state: RootState) => state.productFilter.totalCount;
export const selectFilteredCurrentPage = (state: RootState) => state.productFilter.currentPage;
export const selectFilteredTotalPages = (state: RootState) => state.productFilter.totalPages;
export const selectActiveFilters = (state: RootState) => state.productFilter.activeFilters;