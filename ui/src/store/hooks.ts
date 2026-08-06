import { useDispatch, useSelector, useStore } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './index';

// در تمام اپلیکیشن به جای `useDispatch` از این هوک استفاده کنید
export const useAppDispatch: () => AppDispatch = useDispatch;

// در تمام اپلیکیشن به جای `useSelector` از این هوک استفاده کنید
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// دسترسی مستقیم به خود اینستنس استور (در صورت نیاز)
export const useAppStore: () => AppStore = useStore;