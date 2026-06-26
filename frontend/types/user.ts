import { Order } from "@/types/order";

export type UserRole = "USER" | "ADMIN";

export type UserStatus = "ACTIVE" | "BANNED" | "PENDING";

export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
}

export interface UserBalance {
  username: string;
  balance: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserDetail extends User {
  orders: Order[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
