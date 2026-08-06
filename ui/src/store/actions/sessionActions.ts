import { createAction } from '@reduxjs/toolkit';

/**
 * اکشن مشترک برای پاک‌سازی تمام Stateهای وابسته به نشست کاربر.
 *
 * این اکشن در یک فایل مستقل قرار دارد تا Sliceهای Auth و Cart
 * بدون ایجاد Circular Import به آن گوش دهند.
 */
export const sessionCleared = createAction('session/cleared');
