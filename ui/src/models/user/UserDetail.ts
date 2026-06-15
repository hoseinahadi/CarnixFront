import { addressDto } from "../address/addressDto";

export interface UserDetail {
  userId: number;
  userName: string;
  email: string;
  isActive: boolean;

  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: Date;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate: string;
  avatarUrl: string;
  bio: string;
  address : addressDto[];

}
