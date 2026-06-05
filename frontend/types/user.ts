export interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  role: string;
  status?: string;
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
