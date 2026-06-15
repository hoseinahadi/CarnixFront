// features/content/selectors/ContentManagerSelectors.ts

import type { RootState } from '@/store'; // آدرس استور اصلی پروژه خود را قرار دهید

// دریافت محتوای در حال نمایش
export const selectDisplayContent = (state: RootState) => state.contentManager.displayContent;

// === دریافت لیست جدیدترین مقالات (اضافه شد) ===
export const selectLatestContents = (state: RootState) => state.contentManager.latestContents;

// وضعیت لودینگ برای دریافت اطلاعات
export const selectContentManagerLoading = (state: RootState) => state.contentManager.loading;

// وضعیت لودینگ برای اکشن‌ها
export const selectContentManagerActionLoading = (state: RootState) => state.contentManager.actionLoading;

// دریافت خطاهای احتمالی
export const selectContentManagerError = (state: RootState) => state.contentManager.error;
