// src/app/insurances/model.ts
export interface InsuranceI {
  id?: number;                // aseguradora_id (PK)

  name: string;               // nombre
  nit?: string;               // nit (tax ID)
  phone?: string;             // telefono
  email?: string;             // email
  address?: string;           // direccion

  status: "ACTIVE" | "INACTIVE"; // estado (ACTIVA / INACTIVA)
}
