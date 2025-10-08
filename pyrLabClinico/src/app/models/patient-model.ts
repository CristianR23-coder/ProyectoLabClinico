// src/app/models/patient-model.ts
import { InsuranceI } from './insurance-model';
import { UserI } from './user-model';

// src/app/models/patient-model.ts
export interface PatientI {
  id?: number;
  userId?: number;                    // <── NUEVO
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
  status: 'ACTIVE'|'INACTIVE';
}
