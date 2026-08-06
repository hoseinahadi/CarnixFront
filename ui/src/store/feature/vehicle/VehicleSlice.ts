import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

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

import {
  getAllEngines,
  getAllGenerations,
  getAllMakes,
  getAllTrimDetails,
  getAllTrims,
  getModelsByMakeId,
  getTrimDetails,
} from './VehicleThunks';

export type VehicleLoadStatus =
  | 'idle'
  | 'loading'
  | 'succeeded'
  | 'failed';

interface VehicleState {
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  trims: VehicleTrim[];
  trimDetails: VehicleFilterOption[];
  engines: VehicleEngine[];
  selectedTrimDetail: VehicleTrimDetail | null;

  makesStatus: VehicleLoadStatus;
  trimDetailsStatus: VehicleLoadStatus;
  pendingRequests: number;
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  makes: [],
  models: [],
  generations: [],
  trims: [],
  trimDetails: [],
  engines: [],
  selectedTrimDetail: null,

  makesStatus: 'idle',
  trimDetailsStatus: 'idle',
  pendingRequests: 0,
  loading: false,
  error: null,
};

const beginRequest = (state: VehicleState) => {
  state.pendingRequests += 1;
  state.loading = true;
  state.error = null;
};

const finishRequest = (state: VehicleState) => {
  state.pendingRequests = Math.max(
    0,
    state.pendingRequests - 1,
  );
  state.loading = state.pendingRequests > 0;
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearModels: (state) => {
      state.models = [];
    },
    clearSelectedTrimDetail: (state) => {
      state.selectedTrimDetail = null;
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
    resetVehicleMakesRequest: (state) => {
      if (state.makesStatus !== 'loading') {
        state.makesStatus = 'idle';
        state.error = null;
      }
    },
    resetVehicleFilterOptions: (state) => {
      state.trimDetails = [];
      state.trimDetailsStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMakes.pending, (state) => {
        beginRequest(state);
        state.makesStatus = 'loading';
      })
      .addCase(
        getAllMakes.fulfilled,
        (state, action: PayloadAction<VehicleMake[]>) => {
          finishRequest(state);
          state.makesStatus = 'succeeded';
          state.makes = action.payload;
        },
      )
      .addCase(getAllMakes.rejected, (state, action) => {
        finishRequest(state);
        state.makesStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(getModelsByMakeId.pending, (state) => {
        beginRequest(state);
      })
      .addCase(
        getModelsByMakeId.fulfilled,
        (state, action: PayloadAction<VehicleModel[]>) => {
          finishRequest(state);
          state.models = action.payload;
        },
      )
      .addCase(getModelsByMakeId.rejected, (state, action) => {
        finishRequest(state);
        state.error = action.payload as string;
      })

      .addCase(getAllTrimDetails.pending, (state) => {
        beginRequest(state);
        state.trimDetailsStatus = 'loading';
      })
      .addCase(
        getAllTrimDetails.fulfilled,
        (
          state,
          action: PayloadAction<VehicleFilterOption[]>,
        ) => {
          finishRequest(state);
          state.trimDetailsStatus = 'succeeded';
          state.trimDetails = action.payload;
        },
      )
      .addCase(getAllTrimDetails.rejected, (state, action) => {
        finishRequest(state);
        state.trimDetailsStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(getAllGenerations.pending, (state) => {
        beginRequest(state);
      })
      .addCase(
        getAllGenerations.fulfilled,
        (
          state,
          action: PayloadAction<VehicleGeneration[]>,
        ) => {
          finishRequest(state);
          state.generations = action.payload;
        },
      )
      .addCase(getAllGenerations.rejected, (state, action) => {
        finishRequest(state);
        state.error = action.payload as string;
      })

      .addCase(getAllTrims.pending, (state) => {
        beginRequest(state);
      })
      .addCase(
        getAllTrims.fulfilled,
        (state, action: PayloadAction<VehicleTrim[]>) => {
          finishRequest(state);
          state.trims = action.payload;
        },
      )
      .addCase(getAllTrims.rejected, (state, action) => {
        finishRequest(state);
        state.error = action.payload as string;
      })

      .addCase(getTrimDetails.pending, (state) => {
        beginRequest(state);
      })
      .addCase(
        getTrimDetails.fulfilled,
        (
          state,
          action: PayloadAction<VehicleTrimDetail>,
        ) => {
          finishRequest(state);
          state.selectedTrimDetail = action.payload;
        },
      )
      .addCase(getTrimDetails.rejected, (state, action) => {
        finishRequest(state);
        state.error = action.payload as string;
      })

      .addCase(getAllEngines.pending, (state) => {
        beginRequest(state);
      })
      .addCase(
        getAllEngines.fulfilled,
        (state, action: PayloadAction<VehicleEngine[]>) => {
          finishRequest(state);
          state.engines = action.payload;
        },
      )
      .addCase(getAllEngines.rejected, (state, action) => {
        finishRequest(state);
        state.error = action.payload as string;
      });
  },
});

export const {
  clearModels,
  clearSelectedTrimDetail,
  clearVehicleError,
  resetVehicleMakesRequest,
  resetVehicleFilterOptions,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;
