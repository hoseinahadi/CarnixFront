import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index'; // ایمپورت تایپ‌ها از فایل اصلی store

// در تمام اپلیکیشن به جای `useDispatch` از این هوک استفاده کنید
export const useAppDispatch: () => AppDispatch = useDispatch;

// در تمام اپلیکیشن به جای `useSelector` از این هوک استفاده کنید
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
