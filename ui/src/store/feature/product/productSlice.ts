import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/models/product/Product';
// import { ProductState } from '@/models/product/ProductState'; // اگر اینترفیس دقیق دارید می‌توانید به جای any استفاده کنید
import {
  getAllProducts,
  getProductBySlug,
  getProductDetails,
  getBestSellingProducts,
  getFeaturedProductsPaged,
  getDiscountedProductsPaged,
  fetchPDPAdditionalData,
  getNewestProductsPaged
} from './productThunks';

const initialState: any = {
  products: [],
  bestSellers: null,
  featuredProducts: null, 
  discountedProducts: null, 
  newestProducts: null, // ✅ اضافه شد (چون در extraReducers استفاده شده بود)
  selectedProduct: null,
  productDetails: null,
  bundles: [], 
  effectivePrice: null, 
  
  loading: false,
  bestSellersLoading: false,
  featuredLoading: false, 
  discountedLoading: false, 
  newestLoading: false, // ✅ اضافه شد (چون در extraReducers استفاده شده بود)
  detailsLoading: false,
  actionLoading: false,

  error: null,
  relatedProducts: []
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    // ✅ اضافه شده برای تزریق دیتای SSR به استور به صورت همگام (Hydration)
    setProductDetails: (state, action: PayloadAction<any>) => {
      state.productDetails = action.payload;
      state.detailsLoading = false;
      state.error = null;
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

    // ─── Fetch PDP Additional Data (قیمت موثر و بسته‌ها) ───
    builder
      .addCase(fetchPDPAdditionalData.pending, (state) => {
        // در صورت نیاز وضعیت لودینگ مجزا اضافه کنید
      })
      .addCase(fetchPDPAdditionalData.fulfilled, (state, action) => {
        state.bundles = action.payload.bundles;
        state.effectivePrice = action.payload.effectivePrice;
      })
      .addCase(fetchPDPAdditionalData.rejected, (state, action) => {
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

    // ─── GetFeaturedProductsPaged ───
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

    // ─── GetNewestProductsPaged ───
    builder
      .addCase(getNewestProductsPaged.pending, (state) => {
        state.newestLoading = true;
        state.error = null;
      })
      .addCase(getNewestProductsPaged.fulfilled, (state, action) => {
        state.newestLoading = false;
        state.newestProducts = action.payload;
      })
      .addCase(getNewestProductsPaged.rejected, (state, action) => {
        state.newestLoading = false;
        state.error = action.payload as string;
      });

    // ─── GetDiscountedProductsPaged ───
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

// ✅ setProductDetails اکسپورت شد تا کامپوننت بتواند آن را صدا بزند
export const { setSelectedProduct, setProductDetails, clearProductDetails, clearError } = productSlice.actions;
export default productSlice.reducer;