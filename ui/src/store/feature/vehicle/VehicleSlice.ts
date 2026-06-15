import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { 
  VehicleMake, 
  VehicleModel, 
  VehicleGeneration, 
  VehicleTrim, 
  VehicleEngine, 
  VehicleTrimDetail 
} from '@/models/Vehicle/Vehicle';

import {
  getAllMakes,
  getModelsByMakeId,
  getAllGenerations,
  getAllTrims,
  getTrimDetails,
  getAllEngines
} from './VehicleThunks';

interface VehicleState {
  makes: VehicleMake[];
  models: VehicleModel[];
  generations: VehicleGeneration[];
  trims: VehicleTrim[];
  engines: VehicleEngine[];
  selectedTrimDetail: VehicleTrimDetail | null;
  
  loading: boolean;
  error: string | null;
}

const initialState: VehicleState = {
  makes: [],
  models: [],
  generations: [],
  trims: [],
  engines: [],
  selectedTrimDetail: null,
  
  loading: false,
  error: null,
};

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    // برای زمانی که کاربر برند را عوض می‌کند و می‌خواهید مدل‌های قبلی پاک شوند
    clearModels: (state) => {
      state.models = [];
    },
    clearSelectedTrimDetail: (state) => {
      state.selectedTrimDetail = null;
    },
    clearVehicleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Makes ---
    builder
      .addCase(getAllMakes.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAllMakes.fulfilled, (state, action) => { state.loading = false; state.makes = action.payload; })
      .addCase(getAllMakes.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Models by Make ---
    builder
      .addCase(getModelsByMakeId.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getModelsByMakeId.fulfilled, (state, action) => { state.loading = false; state.models = action.payload; })
      .addCase(getModelsByMakeId.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Generations ---
    builder
      .addCase(getAllGenerations.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAllGenerations.fulfilled, (state, action) => { state.loading = false; state.generations = action.payload; })
      .addCase(getAllGenerations.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Trims ---
    builder
      .addCase(getAllTrims.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAllTrims.fulfilled, (state, action) => { state.loading = false; state.trims = action.payload; })
      .addCase(getAllTrims.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Trim Details ---
    builder
      .addCase(getTrimDetails.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getTrimDetails.fulfilled, (state, action) => { state.loading = false; state.selectedTrimDetail = action.payload; })
      .addCase(getTrimDetails.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });

    // --- Engines ---
    builder
      .addCase(getAllEngines.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(getAllEngines.fulfilled, (state, action) => { state.loading = false; state.engines = action.payload; })
      .addCase(getAllEngines.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
  },
});

export const { clearModels, clearSelectedTrimDetail, clearVehicleError } = vehicleSlice.actions;
export default vehicleSlice.reducer;
