// src/app/patient-insurances/model.ts
export interface PatientInsuranceI {
  patientId: number;
  insuranceId: number;
  policyNumber?: string;
  plan?: string;
  startDate: string;   // 'YYYY-MM-DD'
  endDate?: string;    // 'YYYY-MM-DD'
  status: "ACTIVE" | "INACTIVE"; // estado (ACTIVO / INACTIVO)
}
