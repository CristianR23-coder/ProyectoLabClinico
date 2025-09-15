// Basado en tu tabla resultado
export type ResultState = 'PENDIENTE' | 'VALIDADO' | 'RECHAZADO';

export interface ResultI {
  id?: number;                // resultado_id
  orderId: number;            // orden_id
  sampleId: number;           // muestra_id
  examId: number;             // examen_id
  parameterId: number;        // parametro_id

  numValue?: number | null;  // NUMERIC(18,6)
  textValue?: string | null;     // VARCHAR(200)
  outRange?: boolean | null;    // calculado para numérico
  dateResult?: string;        // ISO datetime
  validatedForId?: number | null;   // FK DoctorI
  validatedFor?: string | null;    // quién validó
  method?: string | null;         // snapshot desde Examen.method
  units?: string | null;       // snapshot desde Parametro.unidad
  comment?: string | null;     // TEXT
  resultState: ResultState;       // estado del resultado
}
