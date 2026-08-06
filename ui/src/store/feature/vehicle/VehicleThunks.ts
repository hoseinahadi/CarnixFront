import { createAsyncThunk } from '@reduxjs/toolkit';

import { VehicleApi } from '@/features/vehicle/api/VehicleApi';

import type {
  VehicleEngine,
  VehicleGeneration,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
  VehicleTrimDetail,
} from '@/models/Vehicle/Vehicle';

import type {
  VehicleFilterOption,
} from '@/models/product/ProductFilters';

type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface VehicleRootState {
  vehicle: {
    makesStatus: LoadStatus;
    trimDetailsStatus: LoadStatus;
  };
}

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
            errors?:
              | string[]
              | Record<string, string[]>;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }

    const errors = response?.data?.errors;

    if (Array.isArray(errors)) {
      return errors.join('، ');
    }

    if (errors && typeof errors === 'object') {
      return Object.values(errors).flat().join('، ');
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'خطای ناشناخته رخ داد';
};

const isRecord = (
  value: unknown,
): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value);

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!isRecord(value)) {
    return [];
  }

  const candidates = [
    value.data,
    value.mainResults,
    value.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (isRecord(candidate) && Array.isArray(candidate.items)) {
      return candidate.items;
    }
  }

  return [];
};

const readNumber = (
  source: Record<string, unknown>,
  keys: readonly string[],
): number | undefined => {
  for (const key of keys) {
    const value = source[key];
    const parsed = Number(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
};

const readString = (
  source: Record<string, unknown>,
  keys: readonly string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const normalizeVehicleFilterOption = (
  value: unknown,
  index: number,
): VehicleFilterOption | null => {
  if (!isRecord(value)) {
    return null;
  }

  const generation = isRecord(value.generation)
    ? value.generation
    : undefined;

  const generationModel = generation?.model;

  const model = isRecord(value.model)
    ? value.model
    : isRecord(generationModel)
      ? generationModel
      : undefined;

  const modelMake = model?.make;

  const make = isRecord(value.make)
    ? value.make
    : isRecord(modelMake)
      ? modelMake
      : undefined;

  const makeId =
    readNumber(value, ['vehicleMakeId', 'makeId']) ??
    (make ? readNumber(make, ['vehicleMakeId', 'makeId', 'id']) : undefined) ??
    (model ? readNumber(model, ['makeId']) : undefined);

  const modelId =
    readNumber(value, ['vehicleModelId', 'modelId']) ??
    (model ? readNumber(model, ['vehicleModelId', 'modelId', 'id']) : undefined);

  if (makeId === undefined || modelId === undefined) {
    return null;
  }

  const directName = readString(value, [
    'displayName',
    'fullName',
    'name',
  ]);

  const makeName =
    readString(value, ['makeName', 'vehicleMakeName']) ??
    (make ? readString(make, ['name']) : undefined);

  const modelName =
    readString(value, ['modelName', 'vehicleModelName']) ??
    (model ? readString(model, ['name']) : undefined);

  const combinedName = [makeName, modelName]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: makeId * 1_000_000 + modelId + index,
    makeId,
    modelId,
    name:
      combinedName ||
      directName ||
      `خودرو ${makeId}-${modelId}`,
  };
};

export const getAllMakes = createAsyncThunk<
  VehicleMake[],
  void,
  {
    state: VehicleRootState;
    rejectValue: string;
  }
>(
  'vehicle/getAllMakes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllMakes();

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت برندهای خودرو',
      );
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    /*
     * failed مجاز به Retry خودکار نیست.
     * Retry باید با resetVehicleMakesRequest و اقدام صریح کاربر باشد.
     */
    condition: (_, { getState }) =>
      getState().vehicle.makesStatus === 'idle',
  },
);

export const getModelsByMakeId = createAsyncThunk<
  VehicleModel[],
  number,
  {
    rejectValue: string;
  }
>(
  'vehicle/getModelsByMakeId',
  async (makeId, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getModelsByMakeId(makeId);

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت مدل‌ها',
      );
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/**
 * گزینه‌های کامل فیلتر خودرو فقط یک‌بار در Redux بارگذاری می‌شوند.
 * بنابراین بازشدن Drawer موبایل درخواست جدید ایجاد نمی‌کند.
 */
export const getAllTrimDetails = createAsyncThunk<
  VehicleFilterOption[],
  void,
  {
    state: VehicleRootState;
    rejectValue: string;
  }
>(
  'vehicle/getAllTrimDetails',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllTrimsWithDetails();
      const rawItems = extractArray(response.data);

      const normalizedItems = rawItems
        .map(normalizeVehicleFilterOption)
        .filter(
          (item): item is VehicleFilterOption => Boolean(item),
        );

      const uniqueVehicles = new Map<
        string,
        VehicleFilterOption
      >();

      normalizedItems.forEach((vehicle) => {
        const key = `${vehicle.makeId}-${vehicle.modelId}`;

        if (!uniqueVehicles.has(key)) {
          uniqueVehicles.set(key, vehicle);
        }
      });

      return Array.from(uniqueVehicles.values());
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
  {
    condition: (_, { getState }) => {
      const status = getState().vehicle.trimDetailsStatus;
      return status === 'idle';
    },
  },
);

export const getAllGenerations = createAsyncThunk<
  VehicleGeneration[],
  void,
  {
    rejectValue: string;
  }
>(
  'vehicle/getAllGenerations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllGenerations();

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت نسل‌ها',
      );
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getAllTrims = createAsyncThunk<
  VehicleTrim[],
  void,
  {
    rejectValue: string;
  }
>(
  'vehicle/getAllTrims',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllTrims();
      const items = extractArray(response.data) as VehicleTrim[];
      return items;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getTrimDetails = createAsyncThunk<
  VehicleTrimDetail,
  number,
  {
    rejectValue: string;
  }
>(
  'vehicle/getTrimDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getTrimDetails(id);

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت جزئیات تیپ',
      );
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const getAllEngines = createAsyncThunk<
  VehicleEngine[],
  void,
  {
    rejectValue: string;
  }
>(
  'vehicle/getAllEngines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllEngines();

      if (response.data.isSuccess) {
        return response.data.data;
      }

      return rejectWithValue(
        response.data.message ||
          'خطا در دریافت موتورها',
      );
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
