// src/app/models/doctor-model.ts
import { UserI } from './user-model';

export interface DoctorI {
  id?: number;
  userId?: number;                    // <── NUEVO
  docType?: string;
  docNumber: string;
  name: string;                       // ej "Juan Perez"
  specialty?: string;
  medicalLicense?: string;
  phone?: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE';
}