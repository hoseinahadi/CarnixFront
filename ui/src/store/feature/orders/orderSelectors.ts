import { RootState } from '@/store';

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder;
export const selectOrdersPagination = (state: RootState) => state.orders.pagination;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrderDetailLoading = (state: RootState) => state.orders.detailLoading;
export const selectOrderActionLoading = (state: RootState) => state.orders.actionLoading;
export const selectOrderError = (state: RootState) => state.orders.error;