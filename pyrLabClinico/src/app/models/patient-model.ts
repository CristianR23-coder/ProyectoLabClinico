// src/app/models/patient-model.ts
import { InsuranceI } from './insurance-model';
import { UserI } from './user-model';

export interface PatientI {
  id?: number;

  docType: string;
  docNumber: string;

  firstName: string;
  lastName: string;

  birthDate?: string;
  gender?: string;

  phone?: string;
  email?: string;
  address?: string;

  insurance?: InsuranceI;

  // NUEVO (opcionales)
  userId?: number;
  user?: UserI;

  status: 'ACTIVE' | 'INACTIVE';
}
