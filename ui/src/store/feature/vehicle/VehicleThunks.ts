import { createAsyncThunk } from '@reduxjs/toolkit';
import { VehicleApi } from '@/features/vehicle/api/VehicleApi'; 
import type { 
  VehicleMake, 
  VehicleModel, 
  VehicleGeneration, 
  VehicleTrim, 
  VehicleEngine, 
  VehicleTrimDetail 
} from '@/models/Vehicle/Vehicle';

// --- Makes ---
export const getAllMakes = createAsyncThunk(
  'vehicle/getAllMakes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllMakes();
      // چون دیتای دریافتی مستقیما یک آرایه است، همان را برمی‌گردانیم
      return response.data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت برندهای خودرو');
    }
  }
);

// --- Models ---
export const getModelsByMakeId = createAsyncThunk(
  'vehicle/getModelsByMakeId',
  async (makeId: number, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getModelsByMakeId(makeId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت مدل‌ها');
    }
  }
);

// --- Generations ---
export const getAllGenerations = createAsyncThunk(
  'vehicle/getAllGenerations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllGenerations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت نسل‌ها');
    }
  }
);

// --- Trims ---
export const getAllTrims = createAsyncThunk(
  'vehicle/getAllTrims',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllTrims();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تیپ‌ها');
    }
  }
);

// --- Trim Details ---
export const getTrimDetails = createAsyncThunk(
  'vehicle/getTrimDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getTrimDetails(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت جزئیات تیپ');
    }
  }
);

// --- Engines ---
export const getAllEngines = createAsyncThunk(
  'vehicle/getAllEngines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await VehicleApi.getAllEngines();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت موتورها');
    }
  }
);
