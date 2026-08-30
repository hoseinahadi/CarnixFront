// store/feature/orders/orderSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchMyOrders, fetchOrderDetail, cancelOrder } from './orderThunks';
import { placeOrderFromCart } from '@/store/feature/cart/cartThunks';
import { OrderDto } from '@/models/order/OrderDto';

interface OrderState {
  orders: OrderDto[];
  selectedOrder: OrderDto | null;
  activeTab: 'all' | 'current' | 'completed' | 'cancelled';
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
  loading: boolean;
  detailLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  lastListFetchKey: string | null;
  lastListFetchedAt: number | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  activeTab: 'all',
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
  },
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  lastListFetchKey: null,
  lastListFetchedAt: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'all' | 'current' | 'completed' | 'cancelled'>) => {
      state.activeTab = action.payload;
    },
    clearOrderError: (state) => { 
      state.error = null; 
    },
    clearSelectedOrder: (state) => { 
      state.selectedOrder = null; 
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch My Orders ───
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        const result = action.payload.result;
        state.orders = result.orders;
        state.lastListFetchKey = action.payload.fetchKey;
        state.lastListFetchedAt = action.payload.fetchedAt;
        state.pagination = {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalCount: result.totalCount,
          pageSize: result.pageSize,
        };
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── Fetch Order Detail ───
    builder
      .addCase(fetchOrderDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      });

    // ─── Cancel Order ───
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.orders.findIndex(o => o.orderId === action.payload);
        if (index !== -1) {
          state.orders[index].orderStatus = 'Cancelled';
          state.orders[index].orderStatusId = 8;
        }
        if (state.selectedOrder?.orderId === action.payload) {
          state.selectedOrder.orderStatus = 'Cancelled';
          state.selectedOrder.orderStatusId = 8;
        }
        state.lastListFetchedAt = null;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // ─── Place Order From Cart ───
    builder
      .addCase(placeOrderFromCart.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(placeOrderFromCart.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.activeTab = 'current';
        // چک کن payload وجود داره و ساختار OrderDto رو داره
        if (action.payload && 'orderId' in action.payload) {
          state.orders.unshift(action.payload as any);
        }
      })
      .addCase(placeOrderFromCart.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveTab, clearOrderError, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;