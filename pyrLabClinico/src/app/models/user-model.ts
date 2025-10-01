export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'STAFF';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserI {
  id?: number;
  username: string;
  role: UserRole;
  status: UserStatus;
  // SOLO para simulación (opcional). Quita en prod real.
  password?: string;
}
