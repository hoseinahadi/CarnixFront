import axiosClient from '@/services/api/common/axiosClient';
import type { OperationResult } from '@/models/common/OperationResult';
import { getCachedRequest } from '@/services/api/common/requestCache';
import type {
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleTrim,
  VehicleEngine,
  VehicleTrimDetail,
} from '@/models/Vehicle/Vehicle';

// Base route for vehicles
const BASE_URL = '/vehicles';
const VEHICLE_REFERENCE_TTL_MS = 10 * 60_000;

export const VehicleApi = {
  // ==========================================
  // Makes (برندها)
  // ==========================================
  
  // دریافت همه برندها
  getAllMakes: () =>
    getCachedRequest(
      'vehicle:makes',
      () => axiosClient.get<OperationResult<VehicleMake[]>>(`${BASE_URL}/makes`),
      VEHICLE_REFERENCE_TTL_MS,
    ),

  // دریافت یک برند با شناسه
  getMakeById: async (id: number) =>
    await axiosClient.get<OperationResult<VehicleMake>>(`${BASE_URL}/makes/${id}`),

  // ==========================================
  // Models (مدل‌ها)
  // ==========================================
// دریافت تریپ‌ها با اطلاعات make و model
  getAllTrimsWithDetails: () =>
    getCachedRequest(
      'vehicle:trims:details',
      () => axiosClient.get(`${BASE_URL}/trims/details`),
      VEHICLE_REFERENCE_TTL_MS,
    ),
  
  // یا دریافت تریپ‌ها به همراه makeId و modelId از طریق join
  getAllTrims: () =>
    getCachedRequest(
      'vehicle:trims',
      () => axiosClient.get(`${BASE_URL}/trims`),
      VEHICLE_REFERENCE_TTL_MS,
    ),
  // دریافت همه مدل‌ها
  getAllModels: async () =>
    await axiosClient.get<OperationResult<VehicleModel[]>>(`${BASE_URL}/models`),

  // دریافت یک مدل با شناسه
  getModelById: async (id: number) =>
    await axiosClient.get<OperationResult<VehicleModel>>(`${BASE_URL}/models/${id}`),

  // دریافت مدل‌های متعلق به یک برند خاص (مثال استفاده از Specification)
  getModelsByMakeId: (makeId: number) =>
    getCachedRequest(
      `vehicle:models:${makeId}`,
      () => axiosClient.get<OperationResult<VehicleModel[]>>(`${BASE_URL}/makes/${makeId}/models`),
      VEHICLE_REFERENCE_TTL_MS,
    ),

  // ==========================================
  // Generations (نسل‌ها)
  // ==========================================

  // دریافت همه نسل‌ها
  getAllGenerations: () =>
    getCachedRequest(
      'vehicle:generations',
      () => axiosClient.get<OperationResult<VehicleGeneration[]>>(`${BASE_URL}/generations`),
      VEHICLE_REFERENCE_TTL_MS,
    ),

  // ==========================================
  // Trims (تیپ‌ها)
  // ==========================================

 
  // دریافت جزئیات کامل یک تیپ (شامل نام مدل، برند و...)
  getTrimDetails: async (id: number) =>
    await axiosClient.get<OperationResult<VehicleTrimDetail>>(`${BASE_URL}/trims/${id}/details`),

  // ==========================================
  // Engines (موتورها)
  // ==========================================

  // دریافت همه موتورها
  getAllEngines: () =>
    getCachedRequest(
      'vehicle:engines',
      () => axiosClient.get<OperationResult<VehicleEngine[]>>(`${BASE_URL}/engines`),
      VEHICLE_REFERENCE_TTL_MS,
    ),
};
