export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserI {
  id?: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
  email?: string | null;
}

export interface AuthenticatedUser extends UserI {
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthenticatedUser;
  token: string;
  refreshToken: string;
}
