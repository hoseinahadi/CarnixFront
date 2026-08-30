// models/product/ProductFilters.ts

export interface VehicleFilter {
  makeId: number;
  modelId: number;
  trimId?: number;
  year?: number;
}

/**
 * مدل سبک مخصوص نمایش خودرو در فیلتر محصولات.
 * بک‌اند می‌تواند نام و شناسه‌ها را با یکی از نام‌های رایج برگرداند؛
 * Thunk خودرو آن‌ها را به این مدل نرمال می‌کند.
 */
export interface VehicleFilterOption {
  id: number;
  makeId: number;
  modelId: number;
  trimId?: number;
  name: string;
}

export type SortOption =
  | 'newest'
  | 'cheapest'
  | 'expensive'
  | 'discounted'
  | 'featured'
  | 'bestsellers'
  | 'mostSold'
  | 'highestRated';

export interface ProductFilters {
  categoryId?: number;
  brandId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortOption;
  page?: number;
  pageSize?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  makeId?: number;
  modelId?: number;
  trimId?: number;
  vehicleIds?: VehicleFilter[];
  searchTerm?: string;
  supplierId?: number;
}

export type ProductFilterParams = ProductFilters;

export const DEFAULT_FILTERS: ProductFilterParams = {
  sortBy: 'newest',
  page: 1,
  pageSize: 20,
};

export const VALID_SORT_OPTIONS: readonly SortOption[] = [
  'newest',
  'cheapest',
  'expensive',
  'discounted',
  'featured',
  'bestsellers',
  'mostSold',
  'highestRated',
];

export const SORT_OPTIONS_LABELS: Record<SortOption, string> = {
  newest: 'جدیدترین',
  cheapest: 'ارزان‌ترین',
  expensive: 'گران‌ترین',
  discounted: 'بیشترین تخفیف',
  featured: 'ویژه',
  bestsellers: 'پرفروش‌ترین',
  mostSold: 'بیشترین فروش',
  highestRated: 'بالاترین امتیاز',
};

interface SearchParamsReader {
  get(name: string): string | null;
}

const parseOptionalNumber = (
  value: string | number | null | undefined,
): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parsePositiveInteger = (
  value: string | number | null | undefined,
  fallback: number,
): number => {
  const parsed = parseOptionalNumber(value);

  if (parsed === undefined || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
};

export const validateSortOption = (
  value: string | null | undefined,
): SortOption => {
  if (
    value &&
    VALID_SORT_OPTIONS.includes(value as SortOption)
  ) {
    return value as SortOption;
  }

  return 'newest';
};

export const createVehicleFilter = (
  makeId: number | null | undefined,
  modelId: number | null | undefined,
  trimId?: number | null,
  year?: number | null,
): VehicleFilter | undefined => {
  const normalizedMakeId = parseOptionalNumber(makeId);
  const normalizedModelId = parseOptionalNumber(modelId);

  if (
    normalizedMakeId === undefined ||
    normalizedModelId === undefined
  ) {
    return undefined;
  }

  const vehicle: VehicleFilter = {
    makeId: normalizedMakeId,
    modelId: normalizedModelId,
  };

  const normalizedTrimId = parseOptionalNumber(trimId);
  const normalizedYear = parseOptionalNumber(year);

  if (normalizedTrimId !== undefined) {
    vehicle.trimId = normalizedTrimId;
  }

  if (normalizedYear !== undefined) {
    vehicle.year = normalizedYear;
  }

  return vehicle;
};

/**
 * همه فیلترها را قبل از قرار گرفتن در Redux، URL یا درخواست API
 * به یک شکل پایدار تبدیل می‌کند.
 */
export const normalizeProductFilters = (
  filters: ProductFilterParams,
): ProductFilterParams => {
  const makeId = parseOptionalNumber(filters.makeId);
  const modelId = parseOptionalNumber(filters.modelId);
  const trimId = parseOptionalNumber(filters.trimId);

  const vehicleFromSingleFields = createVehicleFilter(
    makeId,
    modelId,
    trimId,
  );

  const normalizedVehicles = filters.vehicleIds
    ?.map((vehicle) =>
      createVehicleFilter(
        vehicle.makeId,
        vehicle.modelId,
        vehicle.trimId,
        vehicle.year,
      ),
    )
    .filter((vehicle): vehicle is VehicleFilter => Boolean(vehicle));

  const vehicleIds =
    normalizedVehicles && normalizedVehicles.length > 0
      ? normalizedVehicles
      : vehicleFromSingleFields
        ? [vehicleFromSingleFields]
        : undefined;

  const minPrice = parseOptionalNumber(filters.minPrice);
  const maxPrice = parseOptionalNumber(filters.maxPrice);

  return {
    categoryId: parseOptionalNumber(filters.categoryId),
    brandId: parseOptionalNumber(filters.brandId),
    minPrice,
    maxPrice,
    sortBy: validateSortOption(filters.sortBy),
    page: parsePositiveInteger(filters.page, 1),
    pageSize: parsePositiveInteger(filters.pageSize, 20),
    inStock: filters.inStock === true ? true : undefined,
    hasDiscount: filters.hasDiscount === true ? true : undefined,
    isFeatured: filters.isFeatured === true ? true : undefined,
    isActive:
      typeof filters.isActive === 'boolean'
        ? filters.isActive
        : undefined,
    makeId,
    modelId,
    trimId,
    vehicleIds,
    searchTerm: filters.searchTerm?.trim() || undefined,
    supplierId: parseOptionalNumber(filters.supplierId),
  };
};

export const productFiltersFromSearchParams = (
  searchParams: SearchParamsReader,
  routeCategoryId?: number,
): ProductFilterParams => {
  const makeId = parseOptionalNumber(
    searchParams.get('makeId') ?? searchParams.get('make'),
  );
  const modelId = parseOptionalNumber(
    searchParams.get('modelId') ?? searchParams.get('model'),
  );
  const trimId = parseOptionalNumber(
    searchParams.get('trimId') ?? searchParams.get('trim'),
  );

  const vehicle = createVehicleFilter(
    makeId,
    modelId,
    trimId,
  );

  return normalizeProductFilters({
    categoryId:
      routeCategoryId ??
      parseOptionalNumber(searchParams.get('categoryId')),
    brandId: parseOptionalNumber(searchParams.get('brandId')),
    minPrice: parseOptionalNumber(searchParams.get('minPrice')),
    maxPrice: parseOptionalNumber(searchParams.get('maxPrice')),
    sortBy: validateSortOption(searchParams.get('sortBy')),
    page: parsePositiveInteger(searchParams.get('page'), 1),
    pageSize: parsePositiveInteger(searchParams.get('pageSize'), 20),
    inStock:
      searchParams.get('inStock') === 'true'
        ? true
        : undefined,
    hasDiscount:
      searchParams.get('hasDiscount') === 'true'
        ? true
        : undefined,
    isFeatured:
      searchParams.get('isFeatured') === 'true'
        ? true
        : undefined,
    isActive:
      searchParams.get('isActive') === 'false'
        ? false
        : searchParams.get('isActive') === 'true'
          ? true
          : undefined,
    makeId,
    modelId,
    trimId,
    vehicleIds: vehicle ? [vehicle] : undefined,
    searchTerm: searchParams.get('searchTerm') || undefined,
    supplierId: parseOptionalNumber(searchParams.get('supplierId')),
  });
};

export const productFiltersToSearchParams = (
  sourceFilters: ProductFilterParams,
): URLSearchParams => {
  const filters = normalizeProductFilters(sourceFilters);
  const params = new URLSearchParams();

  const appendNumber = (
    key: string,
    value: number | undefined,
  ) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  };

  appendNumber('brandId', filters.brandId);
  appendNumber('minPrice', filters.minPrice);
  appendNumber('maxPrice', filters.maxPrice);
  appendNumber('makeId', filters.makeId);
  appendNumber('modelId', filters.modelId);
  appendNumber('trimId', filters.trimId);
  appendNumber('supplierId', filters.supplierId);

  if (filters.sortBy && filters.sortBy !== 'newest') {
    params.set('sortBy', filters.sortBy);
  }

  if ((filters.page ?? 1) > 1) {
    params.set('page', String(filters.page));
  }

  if ((filters.pageSize ?? 20) !== 20) {
    params.set('pageSize', String(filters.pageSize));
  }

  if (filters.inStock) {
    params.set('inStock', 'true');
  }

  if (filters.hasDiscount) {
    params.set('hasDiscount', 'true');
  }

  if (filters.isFeatured) {
    params.set('isFeatured', 'true');
  }

  if (typeof filters.isActive === 'boolean') {
    params.set('isActive', String(filters.isActive));
  }

  if (filters.searchTerm) {
    params.set('searchTerm', filters.searchTerm);
  }

  return params;
};

export const buildProductListingUrl = (
  sourceFilters: ProductFilterParams,
  options?: {
    preserveCategorySegment?: string;
    currentRouteCategoryId?: number;
  },
): string => {
  const filters = normalizeProductFilters(sourceFilters);

  let categorySegment: string | undefined;

  if (filters.categoryId !== undefined) {
    const canPreserveCurrentSegment =
      options?.preserveCategorySegment &&
      options.currentRouteCategoryId === filters.categoryId;

    categorySegment = canPreserveCurrentSegment
      ? options.preserveCategorySegment
      : String(filters.categoryId);
  }

  const pathname = categorySegment
    ? `/products/${encodeURIComponent(categorySegment)}`
    : '/products';

  const queryString = productFiltersToSearchParams(filters).toString();

  return queryString
    ? `${pathname}?${queryString}`
    : pathname;
};

/**
 * کلید پایدار برای تشخیص درخواست‌های یکسان و تست Network.
 */
export const createProductFilterRequestKey = (
  filters: ProductFilterParams,
): string => {
  const normalized = normalizeProductFilters(filters);

  return JSON.stringify({
    ...normalized,
    vehicleIds: normalized.vehicleIds ?? [],
  });
};

export const toProductFilterParams = (
  filters: ProductFilters,
): ProductFilterParams => normalizeProductFilters(filters);

export const filtersToQueryString = (
  filters: ProductFilters,
): string => productFiltersToSearchParams(filters).toString();

export const queryStringToFilters = (
  queryString: string,
): ProductFilters =>
  productFiltersFromSearchParams(new URLSearchParams(queryString));

export const isFiltersEmpty = (
  sourceFilters: ProductFilters,
): boolean => {
  const filters = normalizeProductFilters(sourceFilters);

  return !(
    filters.categoryId ||
    filters.brandId ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock ||
    filters.hasDiscount ||
    filters.isFeatured ||
    filters.makeId ||
    filters.modelId ||
    filters.trimId ||
    filters.searchTerm ||
    filters.supplierId
  );
};

export const getActiveFiltersCount = (
  filters: ProductFilters,
): number => {
  const normalized = normalizeProductFilters(filters);

  return [
    normalized.categoryId,
    normalized.brandId,
    normalized.minPrice !== undefined ||
    normalized.maxPrice !== undefined
      ? 'price'
      : undefined,
    normalized.inStock ? 'stock' : undefined,
    normalized.hasDiscount ? 'discount' : undefined,
    normalized.makeId && normalized.modelId
      ? 'vehicle'
      : undefined,
    normalized.searchTerm,
    normalized.supplierId,
  ].filter(Boolean).length;
};

export const mergeFilters = (
  currentFilters: ProductFilters,
  newFilters: Partial<ProductFilters>,
): ProductFilters =>
  normalizeProductFilters({
    ...currentFilters,
    ...newFilters,
    brandId:
      newFilters.categoryId !== undefined &&
      newFilters.categoryId !== currentFilters.categoryId
        ? undefined
        : newFilters.brandId ?? currentFilters.brandId,
  });

export const resetFilters = (): ProductFilters => ({
  ...DEFAULT_FILTERS,
});
