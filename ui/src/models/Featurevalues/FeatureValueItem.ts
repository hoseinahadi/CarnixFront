export interface FeatureValueItem {
  featureValueId: number;
  featureId: number;
  featureName: string;
  valueString?: string;
  valueNumeric?: number | null;
  valueBoolean?: boolean | null;
  optionName?: string;
  dataType?: string;
  unit?: string;
  source?: string; // "Product" یا "Category"
}