import type { Cart } from './Cart';

export type CartFetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface CartState {
  cart: Cart | null;
  loading: boolean;
  actionLoading: boolean;
  /** تعداد mutationهای هم‌زمان؛ جلوی false شدن زودهنگام loading را می‌گیرد. */
  actionPendingCount: number;
  error: string | null;
  fetchStatus: CartFetchStatus;
  /** زمان آخرین fetch موفق برای جلوگیری از درخواست‌های پشت‌سرهم */
  lastFetchedAt: number | null;
}
