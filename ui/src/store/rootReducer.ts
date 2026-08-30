import { combineReducers, type AnyAction } from '@reduxjs/toolkit';

import productReducer from './feature/product/productSlice';
import authReducer from './feature/auth/authSlice';
import cartReducer from './feature/cart/cartSlice';
import brandReducer from './feature/brand/BrandSlice';
import vehicleReducer from './feature/vehicle/VehicleSlice';
import categoryReducer from './feature/Category/categorySlice';
import contentReducer from './feature/content/ContentManagerSlice';
import addressReducer from './feature/address/AddressSlice';
import profileReducer from './feature/profile/profileSlice';
import orderReducer from './feature/orders/orderSlice';
import productDetailReducer from './feature/product/productDetailSlice';
import productFilterReducer from './feature/product/productFilterSlice';
import { sessionCleared } from './actions/sessionActions';

const appReducer = combineReducers({
  product: productReducer,
  cart: cartReducer,
  auth: authReducer,
  brand: brandReducer,
  vehicle: vehicleReducer,
  category: categoryReducer,
  contentManager: contentReducer,
  address: addressReducer,
  profile: profileReducer,
  orders: orderReducer,
  productDetail: productDetailReducer,
  productFilter: productFilterReducer,
});

/** با پایان نشست، تمام stateهای وابسته به کاربر یکجا آزاد می‌شوند. */
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction,
) => {
  if (sessionCleared.match(action)) {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export default rootReducer;
