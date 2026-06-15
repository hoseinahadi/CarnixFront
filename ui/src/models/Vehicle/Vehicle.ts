// --- Base Types ---
export interface BaseEntity {
  id: number;
  isActive: boolean;
  // فیلدهای آدیت در صورت نیاز به نمایش در فرانت‌اند
  // createdAt: string; 
}

// --- Make (برند) ---
export interface VehicleMake extends BaseEntity {
  vehicleMakeId: number;
  name: string;
  englishName: string;
  country: string;
  logoUrl: string;
  
  
}

// --- Model (مدل) ---
export interface VehicleModel extends BaseEntity {
  makeId: number;
  vehicleGenerationId: number;
  bodyType: string;
  name: string;
  
  
  // اگر سرور در Include آن را می‌فرستد:
  make?: VehicleMake; 
}

// --- Generation (نسل) ---
export interface VehicleGeneration extends BaseEntity {
  modelId: number;
  makeName: string;
  yearStart: string | null;
  yearEnd: string | null;

  model?: VehicleModel;
}

// --- Trim (تیپ) ---
export interface VehicleTrim extends BaseEntity {
  generationId: number;
  name: string;
  transmissionType: string;
  drivetrain: string;

  generation?: VehicleGeneration;
}

// --- Engine (موتور) ---
export interface VehicleEngine extends BaseEntity {
  trimId: number;
  engineCode: string;
  fuelType: string;     
  displacement: string; 
  cylinders: string;     
  horsepower: string;     
  torque: string;     
}

// --- Trim Detail (جزئیات کامل یک تیپ - مربوط به مثال Specification) ---
export interface VehicleTrimDetail extends VehicleTrim {
  // در این مدل فرض بر این است که اطلاعات والدها همگی پر شده‌اند
  name: string;
  transmissionType: string;
  drivetrain: string;
  engines?: VehicleEngine[];
  generation?: VehicleGeneration;

}
