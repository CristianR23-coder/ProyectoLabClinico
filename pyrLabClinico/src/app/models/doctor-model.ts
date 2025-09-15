// src/app/doctors/model.ts
export interface DoctorI {
  id?: number;               // medico_id (PK)

  docType?: string;          // tipo_doc
  docNumber: string;         // num_doc (unique)

  name: string;              // nombre
  specialty?: string;        // especialidad
  medicalLicense?: string;   // registro_medico

  phone?: string;            // telefono
  email?: string;            // email

  status: "ACTIVE" | "INACTIVE"; // estado (ACTIVO / INACTIVO)
}
