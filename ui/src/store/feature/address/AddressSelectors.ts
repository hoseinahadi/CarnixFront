// features/address/AddressSelectors.ts
import type { RootState } from '@/store';

export const selectAddresses = (state: RootState) => state.address.addresses;
export const selectSelectedAddress = (state: RootState) => state.address.selectedAddress;
export const selectAddressesLoading = (state: RootState) => state.address.loading;
export const selectAddressesActionLoading = (state: RootState) => state.address.actionLoading;
export const selectAddressesError = (state: RootState) => state.address.error;
export const selectAddressesSuccessMessage = (state: RootState) => state.address.successMessage;