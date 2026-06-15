import { User } from "./User"

// src/models/auth/AuthResponse.ts
export interface AuthResponse {
  token: string
  message?: string;
}
