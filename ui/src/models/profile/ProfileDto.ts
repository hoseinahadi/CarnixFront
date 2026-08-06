export interface UserProfileDetails {
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  bio?: string | null;
  nationalCode?: string | null;
  avatarUrl?: string | null;
}

export interface ProfileDto {
  userId?: number;
  userName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  bio?: string | null;
  nationalCode?: string | null;
  avatarUrl?: string | null;
  userProfile?: UserProfileDetails | null;
}
