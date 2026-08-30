type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;

const readPositiveId = (
  value: unknown,
  keys: readonly string[],
): number | undefined => {
  const record = asRecord(value);
  if (!record) return undefined;

  for (const key of keys) {
    const parsed = Number(record[key]);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
};

/**
 * APIهای خودرو در نسخه‌های مختلف پروژه شناسه برند را گاهی با
 * vehicleMakeId و گاهی با makeId/id برمی‌گردانند. این تابع تنها
 * نقطه‌ی تبدیل آن‌ها به شناسه استاندارد فرانت است.
 */
export const resolveVehicleMakeId = (
  make: unknown,
): number | undefined =>
  readPositiveId(make, ['vehicleMakeId', 'makeId', 'id']);

/**
 * مشابه resolveVehicleMakeId اما برای مدل خودرو. وجود fallback روی id
 * مانع ساخته‌شدن URLهایی مثل modelId=undefined می‌شود.
 */
export const resolveVehicleModelId = (
  model: unknown,
): number | undefined =>
  readPositiveId(model, ['vehicleModelId', 'modelId', 'id']);
