// features/brand/selectors/BrandSelectors.ts
import type { RootState } from '@/store';

export const selectBrands = (state: RootState) => state.brand.brands;
export const selectSelectedBrand = (state: RootState) => state.brand.selectedBrand;
export const selectBrandsLoading = (state: RootState) => state.brand.loading;
export const selectBrandsActionLoading = (state: RootState) => state.brand.actionLoading;
export const selectBrandsError = (state: RootState) => state.brand.error;
