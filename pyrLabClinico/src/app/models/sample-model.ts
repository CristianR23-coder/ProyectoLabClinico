import { SpecimenType } from './exam-model';

// models/sample-model.ts
export type SampleState =
  | 'RECOLECTADA'
  | 'ALMACENADA'
  | 'ENVIADA'
  | 'EN_PROCESO'
  | 'EVALUADA'
  | 'RECHAZADA'
  | 'ANULADA';

export interface SampleI {
  id?: number;
  orderId: number;                 // FK -> orden_lab.orden_id
  type: SpecimenType;              // coherente con los exámenes de la orden
  barcode?: string;                // codigo_barras
  drawDate?: string;               // fecha_toma (ISO)
  state: SampleState;              // estado
  observations?: string;           // observaciones
}
