// features/address/redux/AddressSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

// Base selectors با تضمین خروجی آرایه
export const selectAddresses = (state: RootState) => {
  const addrs = state.address?.addresses;
  return Array.isArray(addrs) ? addrs : [];
};
export const selectSelectedAddress = (state: RootState) => state.address?.selectedAddress || null;
export const selectAddressLoading = (state: RootState) => state.address?.loading || false;
export const selectAddressActionLoading = (state: RootState) => state.address?.actionLoading || null;
export const selectAddressError = (state: RootState) => state.address?.error || null;
export const selectAddressSuccessMessage = (state: RootState) => state.address?.successMessage || null;
// Memoized selectors
export const selectDefaultAddress = createSelector(
  [selectAddresses],
  (addresses) => addresses.find((addr) => addr.isDefault) || null
);

export const selectActiveAddresses = createSelector(
  [selectAddresses],
  (addresses) => addresses.filter((addr) => addr.isActive)
);

export const selectAddressCount = createSelector(
  [selectAddresses],
  (addresses) => addresses.length
);

export const selectIsAnyActionLoading = createSelector(
  [selectAddressActionLoading],
  (actionLoading) => actionLoading !== null
);

export const selectIsCreateLoading = createSelector(
  [selectAddressActionLoading],
  (actionLoading) => actionLoading === 'create'
);

export const selectIsUpdateLoading = createSelector(
  [selectAddressActionLoading],
  (actionLoading) => actionLoading === 'update'
);

export const selectIsDeleteLoading = createSelector(
  [selectAddressActionLoading],
  (actionLoading) => actionLoading === 'delete'
);

export const selectIsSetDefaultLoading = createSelector(
  [selectAddressActionLoading],
  (actionLoading) => actionLoading === 'setDefault'
);