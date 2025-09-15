import { InsuranceI } from "./insurance-model";

// src/app/patients/model.ts
export interface PatientI {
  id?: number;                 // paciente_id (PK)

  docType: string;             // doc_tipo
  docNumber: string;           // doc_numero (unique)

  firstName: string;           // nombres
  lastName: string;            // apellidos

  birthDate?: string;          // fecha_nac (ISO date string: 'YYYY-MM-DD')
  gender?: string;             // sexo

  phone?: string;              // telefono
  email?: string;              // email
  address?: string;            // direccion

  insurance?: InsuranceI;

  status: "ACTIVE" | "INACTIVE"; // estado (ACTIVO / INACTIVO)
}
