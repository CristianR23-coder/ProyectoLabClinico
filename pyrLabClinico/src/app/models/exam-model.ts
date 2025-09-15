export type SpecimenType =
  | 'SANGRE'
  | 'SUERO'
  | 'PLASMA'
  | 'ORINA'
  | 'SALIVA'
  | 'HECES'
  | 'TEJIDO'
  | 'OTRA';

// Interfaz principal del examen (tabla: examen)
export interface ExamI {
  id?: number;                 // examen_id (PK)
  code: string;                // codigo (UNIQUE, NOT NULL)
  name: string;                // nombre (NOT NULL)
  method?: string;             // metodo
  specimenType?: SpecimenType; // muestra_tipo
  processingTimeMin?: number | null; // tiempo_proceso_min (minutos)
  status: "ACTIVE" | "INACTIVE"; // estado (ACTIVO / INACTIVO)
  priceBase: number;           // precio_base (NUMERIC(12,2))
}