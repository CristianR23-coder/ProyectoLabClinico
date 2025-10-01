// src/app/models/doctor-model.ts
import { UserI } from './user-model';

export interface DoctorI {
  id?: number;

  docType?: string;
  docNumber: string;

  name: string;
  specialty?: string;
  medicalLicense?: string;

  phone?: string;
  email?: string;

  // NUEVO
  userId?: number;
  user?: UserI;

  status: 'ACTIVE' | 'INACTIVE';
}
