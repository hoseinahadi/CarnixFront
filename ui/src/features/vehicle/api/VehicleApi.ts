import axiosInstance from '@/services/api/common/axiosInstance';
import type { OperationResult } from '@/models/common/OperationResult';
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

export const VehicleApi = {
  // ==========================================
  // Makes (برندها)
  // ==========================================
  
  // دریافت همه برندها
  getAllMakes: async () =>
    await axiosInstance.get<OperationResult<VehicleMake[]>>(`${BASE_URL}/makes`),

  // دریافت یک برند با شناسه
  getMakeById: async (id: number) =>
    await axiosInstance.get<OperationResult<VehicleMake>>(`${BASE_URL}/makes/${id}`),

  // ==========================================
  // Models (مدل‌ها)
  // ==========================================
// دریافت تریپ‌ها با اطلاعات make و model
  getAllTrimsWithDetails: async () =>
    await axiosInstance.get(`${BASE_URL}/trims/details`),
  
  // یا دریافت تریپ‌ها به همراه makeId و modelId از طریق join
  getAllTrims: async () =>
    await axiosInstance.get(`${BASE_URL}/trims`),
  // دریافت همه مدل‌ها
  getAllModels: async () =>
    await axiosInstance.get<OperationResult<VehicleModel[]>>(`${BASE_URL}/models`),

  // دریافت یک مدل با شناسه
  getModelById: async (id: number) =>
    await axiosInstance.get<OperationResult<VehicleModel>>(`${BASE_URL}/models/${id}`),

  // دریافت مدل‌های متعلق به یک برند خاص (مثال استفاده از Specification)
  getModelsByMakeId: async (makeId: number) =>
    await axiosInstance.get<OperationResult<VehicleModel[]>>(`${BASE_URL}/makes/${makeId}/models`),

  // ==========================================
  // Generations (نسل‌ها)
  // ==========================================

  // دریافت همه نسل‌ها
  getAllGenerations: async () =>
    await axiosInstance.get<OperationResult<VehicleGeneration[]>>(`${BASE_URL}/generations`),

  // ==========================================
  // Trims (تیپ‌ها)
  // ==========================================

 
  // دریافت جزئیات کامل یک تیپ (شامل نام مدل، برند و...)
  getTrimDetails: async (id: number) =>
    await axiosInstance.get<OperationResult<VehicleTrimDetail>>(`${BASE_URL}/trims/${id}/details`),

  // ==========================================
  // Engines (موتورها)
  // ==========================================

  // دریافت همه موتورها
  getAllEngines: async () =>
    await axiosInstance.get<OperationResult<VehicleEngine[]>>(`${BASE_URL}/engines`),
};
