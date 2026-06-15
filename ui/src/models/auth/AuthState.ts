import { UserDetail } from "../user/UserDetail";
import { UserRole } from "../user/UserRole";
import { AuthResponse } from "./AuthResponse";
import { User } from "./User";

export interface AuthState {
  user: AuthResponse['token'] | null; // اطلاعات پایه از لاگین
  userDetail: UserDetail | null;     // اطلاعات تکمیلی از getMe
  roles: UserRole | null;            // نقش‌ها از getRoles
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}