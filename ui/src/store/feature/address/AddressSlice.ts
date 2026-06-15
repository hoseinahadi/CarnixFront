import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AddressResponseDto } from '@/models/address/AddressResponseDto';
import {
  fetchAddresses,
  fetchAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './AddressThunks';

interface AddressState {
  addresses: AddressResponseDto[];
  selectedAddress: AddressResponseDto | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  actionLoading: false,
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
    setSelectedAddress: (state, action: PayloadAction<AddressResponseDto | null>) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch All Addresses ───
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── Fetch Address By Id ───
    builder
      .addCase(fetchAddressById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAddress = action.payload;
      })
      .addCase(fetchAddressById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── Create Address ───
    builder
      .addCase(createAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'آدرس با موفقیت ایجاد شد';
        // اگر بک‌اند لیست کامل برگرداند
        if (Array.isArray(action.payload)) {
          state.addresses = action.payload;
        } else if (action.payload) {
          // اگر فقط یک آدرس برگرداند
          state.addresses.push(action.payload);
        }
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Update Address ───
    builder
      .addCase(updateAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'آدرس با موفقیت ویرایش شد';
        // اگر بک‌اند لیست کامل برگرداند
        if (Array.isArray(action.payload)) {
          state.addresses = action.payload;
        } else if (action.payload) {
          // اگر فقط یک آدرس برگرداند، آن را جایگزین کن
          const index = state.addresses.findIndex(a => a.userAddressId === action.payload.userAddressId);
          if (index !== -1) {
            state.addresses[index] = action.payload;
          }
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Delete Address ───
    builder
      .addCase(deleteAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'آدرس با موفقیت حذف شد';
        // اگر بک‌اند لیست کامل برگرداند
        if (Array.isArray(action.payload)) {
          state.addresses = action.payload;
        } else if (action.payload) {
          // اگر شناسه برگرداند، آن را از لیست حذف کن
          state.addresses = state.addresses.filter(a => a.userAddressId !== action.payload);
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Set Default Address ───
    builder
      .addCase(setDefaultAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = 'آدرس پیش‌فرض با موفقیت تغییر کرد';
        // اگر بک‌اند لیست کامل برگرداند
        if (Array.isArray(action.payload)) {
          state.addresses = action.payload;
        } else if (action.payload) {
          // اگر یک آدرس برگرداند، آن را جایگزین کن
          const index = state.addresses.findIndex(a => a.userAddressId === action.payload.userAddressId);
          if (index !== -1) {
            state.addresses[index] = action.payload;
          }
        }
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;