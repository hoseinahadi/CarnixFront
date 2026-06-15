// مسیر: src/features/products/store/ProductSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/models/product/Product';
import { ProductState } from '@/models/product/ProductState'; // مطمئن شوید مسیر درست است
import { 
  getAllProducts, 
  getProductBySlug, 
  getProductDetails, 
  getBestSellingProducts,
  getFeaturedProductsPaged, // 🟢
  getDiscountedProductsPaged // 🟢
} from './productThunks';

const initialState: ProductState = {
  products: [],
  bestSellers: null,
  featuredProducts: null, // 🟢
  discountedProducts: null, // 🟢
  selectedProduct: null,
  productDetails: null,
  
  loading: false,
  bestSellersLoading: false,
  featuredLoading: false, // 🟢
  discountedLoading: false, // 🟢
  detailsLoading: false,
  actionLoading: false,
  
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearProductDetails: (state) => {
      state.productDetails = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ─── GetAllProducts ───
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ─── GetBestSellingProducts ───
    builder
      .addCase(getBestSellingProducts.pending, (state) => {
        state.bestSellersLoading = true;
        state.error = null;
      })
      .addCase(getBestSellingProducts.fulfilled, (state, action) => {
        state.bestSellersLoading = false;
        state.bestSellers = action.payload;
      })
      .addCase(getBestSellingProducts.rejected, (state, action) => {
        state.bestSellersLoading = false;
        state.error = action.payload as string;
      });

    // 🟢 ─── GetFeaturedProductsPaged ───
    builder
      .addCase(getFeaturedProductsPaged.pending, (state) => {
        state.featuredLoading = true;
        state.error = null;
      })
      .addCase(getFeaturedProductsPaged.fulfilled, (state, action) => {
        state.featuredLoading = false;
        state.featuredProducts = action.payload;
      })
      .addCase(getFeaturedProductsPaged.rejected, (state, action) => {
        state.featuredLoading = false;
        state.error = action.payload as string;
      });

    // 🟢 ─── GetDiscountedProductsPaged ───
    builder
      .addCase(getDiscountedProductsPaged.pending, (state) => {
        state.discountedLoading = true;
        state.error = null;
      })
      .addCase(getDiscountedProductsPaged.fulfilled, (state, action) => {
        state.discountedLoading = false;
        state.discountedProducts = action.payload;
      })
      .addCase(getDiscountedProductsPaged.rejected, (state, action) => {
        state.discountedLoading = false;
        state.error = action.payload as string;
      });

    // ─── GetProductBySlug ───
    builder
      .addCase(getProductBySlug.pending, (state) => {
        state.detailsLoading = true;
        state.productDetails = null;
        state.error = null;
      })
      .addCase(getProductBySlug.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(getProductBySlug.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });

    // ─── GetProductDetails (By ID) ───
    builder
      .addCase(getProductDetails.pending, (state) => {
        state.detailsLoading = true;
        state.productDetails = null;
        state.error = null;
      })
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        state.productDetails = action.payload;
      })
      .addCase(getProductDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProduct, clearProductDetails, clearError } = productSlice.actions;
export default productSlice.reducer;
