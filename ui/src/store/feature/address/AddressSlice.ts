// features/address/redux/AddressSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import {
  fetchAddresses,
  
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './AddressThunks';

interface AddressState {
  addresses: AddressResponseDto[];
  selectedAddress: AddressResponseDto | null;
  loading: boolean;
  fetchStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  lastFetchedAt: number | null;
  actionLoading: string | null;
  error: string | null;
  successMessage: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  fetchStatus: 'idle',
  lastFetchedAt: null,
  actionLoading: null,
  error: null,
  successMessage: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearAllMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedAddress: (state, action: PayloadAction<AddressResponseDto | null>) => {
      state.selectedAddress = action.payload;
    },
    resetAddressState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ─── Fetch All Addresses ───────────────────────────────
      .addCase(fetchAddresses.pending, (state) => {
        state.fetchStatus = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.fetchStatus = 'succeeded';
        state.loading = false;
        state.addresses = action.payload.addresses;
        state.lastFetchedAt = action.payload.fetchedAt;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.loading = false;
        state.error = action.payload as string;
      })

      

      // ─── Create Address ───────────────────────────────
      .addCase(createAddress.pending, (state) => {
        state.actionLoading = 'create';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.actionLoading = null;
        // چون بعد از mutation دیگر GET کامل نمی‌زنیم، یکتایی آدرس پیش‌فرض را محلی حفظ می‌کنیم.
        if (action.payload.isDefault) {
          state.addresses.forEach((address) => {
            address.isDefault = false;
          });
        }
        state.addresses.push(action.payload);
        state.lastFetchedAt = Date.now();
        state.successMessage = 'آدرس با موفقیت ایجاد شد';
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      })

      // ─── Update Address ───────────────────────────────
      .addCase(updateAddress.pending, (state) => {
        state.actionLoading = 'update';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.actionLoading = null;
        // API فقط یک آدرس برمیگردونه، جایگزین میکنیم
        if (action.payload.isDefault) {
          state.addresses.forEach((address) => {
            if (address.userAddressId !== action.payload.userAddressId) {
              address.isDefault = false;
            }
          });
        }
        const index = state.addresses.findIndex(
          (a) => a.userAddressId === action.payload.userAddressId
        );
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
        state.lastFetchedAt = Date.now();
        // اگر همین آدرس انتخاب شده بود، آپدیتش کن
        if (state.selectedAddress?.userAddressId === action.payload.userAddressId) {
          state.selectedAddress = action.payload;
        }
        state.successMessage = 'آدرس با موفقیت ویرایش شد';
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      })

      // ─── Delete Address ───────────────────────────────
      .addCase(deleteAddress.pending, (state) => {
        state.actionLoading = 'delete';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.actionLoading = null;
        // حذف از لیست با شناسه
        state.addresses = state.addresses.filter(
          (a) => a.userAddressId !== action.payload
        );
        // اگر آدرس انتخاب شده حذف شده بود، پاکش کن
        if (state.selectedAddress?.userAddressId === action.payload) {
          state.selectedAddress = null;
        }
        state.lastFetchedAt = Date.now();
        state.successMessage = 'آدرس با موفقیت حذف شد';
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      })

      // ─── Set Default Address ───────────────────────────────
      .addCase(setDefaultAddress.pending, (state) => {
        state.actionLoading = 'setDefault';
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.actionLoading = null;
        // آپدیت محلی: فقط یک آدرس میتونه پیش‌فرض باشه
        state.addresses = state.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.userAddressId === action.payload,
        }));
        // آپدیت selectedAddress هم اگه لازم بود
        if (state.selectedAddress) {
          state.selectedAddress = {
            ...state.selectedAddress,
            isDefault: state.selectedAddress.userAddressId === action.payload,
          };
        }
        state.lastFetchedAt = Date.now();
        state.successMessage = 'آدرس پیش‌فرض با موفقیت تغییر کرد';
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.actionLoading = null;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearSuccessMessage,
  clearAllMessages,
  setSelectedAddress,
  resetAddressState,
} = addressSlice.actions;

export default addressSlice.reducer;