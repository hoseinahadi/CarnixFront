export interface UpdateAddressDto {
  userAddressId: number;
  addressTitle: string;
  recipientName: string;
  phoneNumber: string;
  landlineNumber?: string;
  fullAddress: string;
  city: string;
  province: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  isActive: boolean;
}