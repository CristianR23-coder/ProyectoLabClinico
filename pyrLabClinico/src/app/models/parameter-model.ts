// models/parametro-model.ts

export type TypeValue = 'NUMERICO' | 'TEXTO' | 'CUALITATIVO' | 'BOOLEAN';

export interface ParameterI {
    id?: number;     // SERIAL PK
    examenId: number;         // FK -> examen.examen_id
    code?: string | null;   // Código opcional
    name: string;           // Nombre del parámetro (obligatorio)
    unit?: string | null;   // Unidad (mg/dL, %, etc.)
    refMin?: number | null;   // Valor mínimo de referencia
    refMax?: number | null;   // Valor máximo de referencia
    typeValue: TypeValue;     // Tipo de valor (NUMERICO, TEXTO, etc.)
    decimals?: number | null;       // Cantidad de decimales si es numérico
    visualOrder?: number;     // Orden de aparición en el reporte
}
