'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { fetchCategories } from '@/store/feature/Category/categoryThunks';

import {
  fetchFilteredProducts,
  setFilters,
} from '@/store/feature/product/productFilterSlice';

import {
  selectActiveFilters,
  selectFilteredCurrentPage,
  selectFilteredLoading,
  selectFilteredProducts,
  selectFilteredTotalCount,
  selectFilteredTotalPages,
} from '@/store/feature/product/productFilterSelectors';

import {
  buildProductListingUrl,
  normalizeProductFilters,
  productFiltersFromSearchParams,
  type ProductFilterParams,
  type SortOption,
} from '@/models/product/ProductFilters';

import {
  useAppDispatch,
  useAppSelector,
} from '@/store/hooks';

interface UseProductListingControllerOptions {
  categorySlug?: string;
}

interface ApplyFilterOptions {
  resetPage?: boolean;
}

const decodeCategorySegment = (
  categorySlug: string,
): string => {
  try {
    return decodeURIComponent(categorySlug);
  } catch {
    return categorySlug;
  }
};

export const useProductListingController = (
  options: UseProductListingControllerOptions = {},
) => {
  const { categorySlug } = options;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const products = useAppSelector(selectFilteredProducts);
  const loading = useAppSelector(selectFilteredLoading);
  const totalCount = useAppSelector(selectFilteredTotalCount);
  const currentPage = useAppSelector(selectFilteredCurrentPage);
  const totalPages = useAppSelector(selectFilteredTotalPages);
  const activeFilters = useAppSelector(selectActiveFilters);

  const categories = useAppSelector(
    (state) => state.category.categories,
  );

  const categoriesLoading = useAppSelector(
    (state) => state.category.loading,
  );

  const categoriesError = useAppSelector(
    (state) => state.category.error,
  );

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const requestSequenceRef = useRef(0);

  const decodedCategorySlug = useMemo(
    () =>
      categorySlug
        ? decodeCategorySegment(categorySlug)
        : undefined,
    [categorySlug],
  );

  const numericCategoryId = useMemo(() => {
    if (!categorySlug || !/^\d+$/.test(categorySlug)) {
      return undefined;
    }

    const parsed = Number(categorySlug);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [categorySlug]);

  useEffect(() => {
    if (
      categories.length === 0 &&
      !categoriesLoading &&
      !categoriesError
    ) {
      void dispatch(fetchCategories());
    }
  }, [
    dispatch,
    categories.length,
    categoriesLoading,
    categoriesError,
  ]);

  const resolvedCategory = useMemo(() => {
    if (!categorySlug) {
      return undefined;
    }

    if (numericCategoryId !== undefined) {
      return categories.find(
        (category) =>
          Number(category.categoryId) === numericCategoryId,
      );
    }

    return categories.find((category) => {
      const categorySlugValue = category.slug?.trim();
      const categoryName = category.name?.trim();

      return (
        categorySlugValue === decodedCategorySlug ||
        categoryName === decodedCategorySlug
      );
    });
  }, [
    categorySlug,
    numericCategoryId,
    decodedCategorySlug,
    categories,
  ]);

  const routeCategoryId =
    numericCategoryId ?? resolvedCategory?.categoryId;

  const categoryResolutionError = Boolean(
    categorySlug &&
      numericCategoryId === undefined &&
      categoriesError,
  );

  const waitingForCategoryResolution = Boolean(
    categorySlug &&
      numericCategoryId === undefined &&
      categories.length === 0 &&
      !categoryResolutionError,
  );

  const categoryNotFound = Boolean(
    categorySlug &&
      numericCategoryId === undefined &&
      categories.length > 0 &&
      !resolvedCategory,
  );

  const queryString = searchParams.toString();

  const filtersFromUrl = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return productFiltersFromSearchParams(
      params,
      routeCategoryId,
    );
  }, [queryString, routeCategoryId]);

  useEffect(() => {
    if (
      waitingForCategoryResolution ||
      categoryNotFound ||
      categoryResolutionError
    ) {
      return;
    }

    const requestSequence =
      requestSequenceRef.current + 1;

    requestSequenceRef.current = requestSequence;

    dispatch(setFilters(filtersFromUrl));

    const request = dispatch(
      fetchFilteredProducts(filtersFromUrl),
    );

    void request.finally(() => {
      if (
        requestSequenceRef.current === requestSequence
      ) {
        setIsFirstLoad(false);
      }
    });

    return () => {
      request.abort();
    };
  }, [
    dispatch,
    filtersFromUrl,
    waitingForCategoryResolution,
    categoryNotFound,
    categoryResolutionError,
  ]);

  const navigateToFilters = useCallback(
    (
      patch: Partial<ProductFilterParams>,
      applyOptions: ApplyFilterOptions = {},
    ) => {
      const { resetPage = true } = applyOptions;

      const nextFilters = normalizeProductFilters({
        ...activeFilters,
        ...patch,
        page: resetPage
          ? 1
          : patch.page ?? activeFilters.page ?? 1,
      });

      /*
       * UI بلافاصله به‌روز می‌شود، اما Fetch فقط پس از تغییر URL
       * و فقط داخل Effect بالای همین Hook انجام خواهد شد.
       */
      dispatch(setFilters(nextFilters));

      const nextUrl = buildProductListingUrl(
        nextFilters,
        {
          preserveCategorySegment: categorySlug,
          currentRouteCategoryId: routeCategoryId,
        },
      );

      const currentUrl = queryString
        ? `${pathname}?${queryString}`
        : pathname;

      if (nextUrl !== currentUrl) {
        router.replace(nextUrl, {
          scroll: false,
        });
      }
    },
    [
      activeFilters,
      categorySlug,
      dispatch,
      pathname,
      queryString,
      routeCategoryId,
      router,
    ],
  );

  const clearFilters = useCallback(() => {
    const clearedFilters = normalizeProductFilters({
      sortBy: activeFilters.sortBy ?? 'newest',
      page: 1,
      pageSize: activeFilters.pageSize ?? 20,
    });

    dispatch(setFilters(clearedFilters));

    router.replace(
      buildProductListingUrl(clearedFilters),
      {
        scroll: false,
      },
    );
  }, [activeFilters, dispatch, router]);

  const changePage = useCallback(
    (page: number) => {
      navigateToFilters(
        {
          page,
        },
        {
          resetPage: false,
        },
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    [navigateToFilters],
  );

  const changeSort = useCallback(
    (sortBy: SortOption) => {
      navigateToFilters({
        sortBy,
        page: 1,
      });
    },
    [navigateToFilters],
  );

  const displayTitle = useMemo(() => {
    if (!categorySlug) {
      return 'محصولات';
    }

    if (resolvedCategory?.name) {
      return resolvedCategory.name;
    }

    if (numericCategoryId !== undefined) {
      return 'محصولات';
    }

    return (decodedCategorySlug || 'محصولات').replace(
      /-/g,
      ' ',
    );
  }, [
    categorySlug,
    decodedCategorySlug,
    numericCategoryId,
    resolvedCategory,
  ]);

  return {
    products,
    loading,
    totalCount,
    currentPage,
    totalPages,
    activeFilters,
    isFirstLoad,
    showSkeleton:
      isFirstLoad ||
      loading ||
      waitingForCategoryResolution,
    displayTitle,
    categoryNotFound,
    categoryResolutionError,
    categoriesError,
    navigateToFilters,
    clearFilters,
    changePage,
    changeSort,
  };
};
