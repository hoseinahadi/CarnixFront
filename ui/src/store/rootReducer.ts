import { combineReducers } from '@reduxjs/toolkit';

// ایمپورت کردن Reducer از هر Slice
import productReducer from './feature/product/productSlice';
 import authReducer from './feature/auth/authSlice' 
 import cartReducer from './feature/cart/cartSlice'
 import brandReducer from './feature/brand/BrandSlice'
 import vehicleReducer from './feature/vehicle/VehicleSlice'
 import categoryReducer from './feature/Category/categorySlice'
 import contentReducer from './feature/content/ContentManagerSlice'
 import addressReducer from './feature/address/AddressSlice'
 import profileReducer from './feature/profile/profileSlice';       
import orderReducer from './feature/orders/orderSlice';   
import productDetailReducer from './feature/product/productDetailSlice';
import productFilterReducer from './feature/product/productFilterSlice';
const rootReducer = combineReducers({
  // اینجا مشخص می‌کنید که هر بخش از استیت با چه نامی شناخته شود
  product: productReducer,
  cart: cartReducer,
  auth: authReducer,
  brand:brandReducer,
  vehicle:vehicleReducer,
  category:categoryReducer,
  contentManager: contentReducer,
  address: addressReducer,
  profile: profileReducer,     // ✅
    orders: orderReducer,
    productDetail: productDetailReducer, 
    productFilter: productFilterReducer,
});

export default rootReducer;
