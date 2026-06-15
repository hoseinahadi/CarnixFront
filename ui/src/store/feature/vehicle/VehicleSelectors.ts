import type { RootState } from '@/store';

export const selectMakes = (state: RootState) => state.vehicle.makes;
export const selectModels = (state: RootState) => state.vehicle.models;
export const selectGenerations = (state: RootState) => state.vehicle.generations;
export const selectTrims = (state: RootState) => state.vehicle.trims;
export const selectEngines = (state: RootState) => state.vehicle.engines;

export const selectSelectedTrimDetail = (state: RootState) => state.vehicle.selectedTrimDetail;

export const selectVehicleLoading = (state: RootState) => state.vehicle.loading;
export const selectVehicleError = (state: RootState) => state.vehicle.error;
