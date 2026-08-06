import { createAsyncThunk } from '@reduxjs/toolkit';
import { ProductFilters } from '@/models/product/ProductFilters';
import { ProductApi } from '@/services/api/product/productApi';

export const getAllProducts = createAsyncThunk(
  'product/getAll',
  async (filters: ProductFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getAll(filters);
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات');
    }
  }
);

interface GetBestSellersArgs {
  pageNumber?: number;
  pageSize?: number;
  includeAll?: boolean;
}

export const getBestSellingProducts = createAsyncThunk(
  'product/getBestSellers',
  async (args: GetBestSellersArgs, { rejectWithValue }) => {
    try {
      // 🟢 includeAll به صورت پیش‌فرض true قرار گرفت
      const { pageNumber = 1, pageSize = 5, includeAll = true } = args;
      const response = await ProductApi.getBestSellers(pageNumber, pageSize, includeAll);
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت پرفروش‌ترین‌ها');
    }
  }
);

interface GetPagedArgs {
  pageNumber?: number;
  pageSize?: number;
}

export const getNewestProductsPaged = createAsyncThunk(
  'product/getNewestPaged',
  async (args: GetPagedArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getFiltered({
        sortBy: 'newest',
        page: pageNumber,
        pageSize: pageSize
      });
      
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جدیدترین محصولات');
    }
  }
);

export const getFeaturedProductsPaged = createAsyncThunk(
  'product/getFeaturedPaged',
  async (args: GetPagedArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getFeaturedPaged(pageNumber, pageSize);
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات ویژه');
    }
  }
);

export const getDiscountedProductsPaged = createAsyncThunk(
  'product/getDiscountedPaged',
  async (args: GetPagedArgs, { rejectWithValue }) => {
    try {
      const { pageNumber = 1, pageSize = 5 } = args;
      const response = await ProductApi.getDiscountedPaged(pageNumber, pageSize);
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت محصولات تخفیف‌دار');
    }
  }
);

export const getProductDetails = createAsyncThunk(
  'product/getDetails',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getDetails(id);
      if (response.data.isSuccess) {
        return (response.data as any).data || (response.data as any).mainResults || response.data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات محصول');
    }
  }
);

// src/store/feature/product/productThunks.ts
export const getProductBySlug = createAsyncThunk(
  'product/getBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await ProductApi.getBySlug(slug);
      
      // ✅ این را اضافه کنید
      console.log('🔴 Full API Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.isSuccess) {
        const data = (response.data as any).data || (response.data as any).mainResults || response.data;
        
        // ✅ این را اضافه کنید  
        console.log('🔴 Product Data Keys:', Object.keys(data));
        console.log('🔴 Feature Values:', data.featureValues);
        console.log('🔴 Has FeatureValues?', 'featureValues' in data);
        
        return data;
      }
      return rejectWithValue(response.data.message);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اطلاعات محصول');
    }
  }
);

export const fetchPDPAdditionalData = createAsyncThunk(
  'product/fetchPDPAdditionalData',
  async (productId: number, { rejectWithValue }) => {
    try {
      const [priceRes, bundlesRes] = await Promise.all([
        ProductApi.getEffectivePrice(productId),
        ProductApi.getAllBundles() 
      ]);

      let effectivePrice = null;
      if (priceRes.data.isSuccess) {
        effectivePrice = (priceRes.data as any).data || (priceRes.data as any).mainResults || priceRes.data;
      }

      let productBundles: any[] = [];
      if (bundlesRes.data.isSuccess) {
        const bData = (bundlesRes.data as any).data || (bundlesRes.data as any).mainResults || bundlesRes.data;
        if (bData && Array.isArray(bData)) {
          productBundles = bData.filter((b: any) => 
            b.items?.some((item: any) => item.productId === productId)
          );
        }
      }

      return {
        effectivePrice,
        bundles: productBundles
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اطلاعات تکمیلی');
    }
  }
);
interface ProductPdpThunkState {
  productDetail: {
    currentProductId: number | null;
    effectivePriceLoading: boolean;
    effectivePriceLoaded: boolean;
    effectivePriceProductId: number | null;
    bundlesLoading: boolean;
    bundlesLoaded: boolean;
    bundlesProductId: number | null;
  };
}

export const fetchEffectivePrice = createAsyncThunk<
  number | null,
  {
    productId: number;
    force?: boolean;
  },
  {
    state: ProductPdpThunkState;
    rejectValue: string;
  }
>(
  'product/fetchEffectivePrice',
  async (
    { productId },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await ProductApi.getEffectivePrice(
          productId,
        );

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت قیمت محصول',
        );
      }

      return (
        response.data.data ??
        (response.data as { mainResults?: number })
          .mainResults ??
        null
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'خطا در دریافت قیمت محصول',
      );
    }
  },
  {
    condition: (
      {
        productId,
        force = false,
      },
      { getState },
    ) => {
      if (force) {
        return true;
      }

      const state = getState().productDetail;

      if (
        state.currentProductId !== productId
      ) {
        return false;
      }

      if (
        state.effectivePriceLoading &&
        state.effectivePriceProductId === productId
      ) {
        return false;
      }

      if (
        state.effectivePriceLoaded &&
        state.effectivePriceProductId === productId
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchProductBundles = createAsyncThunk<
  import('@/models/ProductBundle/ProductBundle').ProductBundleDto[],
  {
    productId: number;
    force?: boolean;
  },
  {
    state: ProductPdpThunkState;
    rejectValue: string;
  }
>(
  'product/fetchProductBundles',
  async (
    { productId },
    { rejectWithValue },
  ) => {
    try {
      const response =
        await ProductApi.getAllBundles();

      if (!response.data.isSuccess) {
        return rejectWithValue(
          response.data.message ||
            'خطا در دریافت بسته‌های محصول',
        );
      }

      const allBundles =
        response.data.data ??
        (response.data as {
          mainResults?: import('@/models/ProductBundle/ProductBundle').ProductBundleDto[];
        }).mainResults ??
        [];

      if (!Array.isArray(allBundles)) {
        return [];
      }

      return allBundles.filter((bundle) =>
        bundle.items?.some(
          (item) => item.productId === productId,
        ),
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          'خطا در دریافت بسته‌های محصول',
      );
    }
  },
  {
    condition: (
      {
        productId,
        force = false,
      },
      { getState },
    ) => {
      if (force) {
        return true;
      }

      const state = getState().productDetail;

      if (
        state.currentProductId !== productId
      ) {
        return false;
      }

      if (
        state.bundlesLoading &&
        state.bundlesProductId === productId
      ) {
        return false;
      }

      if (
        state.bundlesLoaded &&
        state.bundlesProductId === productId
      ) {
        return false;
      }

      return true;
    },
  },
);
