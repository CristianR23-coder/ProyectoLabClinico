// models/panel-model.ts
export type PanelState = 'ACTIVO' | 'INACTIVO';
export type PanelItemKind = 'EXAM' | 'PARAM';

export interface PanelItemI {
    id?: number;             // id interno del item de panel (opcional si lo manejas en DB)
    kind: PanelItemKind;     // 'EXAM' | 'PARAM'
    examId?: number | null;  // si kind === 'EXAM'
    parameterId?: number | null; // si kind === 'PARAM'
    required?: boolean;      // si el item es obligatorio
    order?: number | null;   // orden de visualización
    notes?: string | null;   // nota/observación opcional
}

export interface PanelI {
    id?: number;
    name: string;                // nombre del panel (Perfil lipídico, Panel hepático…)
    description?: string | null; // descripción corta
    state: PanelState;           // ACTIVO / INACTIVO
    items: PanelItemI[];         // composición del panel
    createdAt?: string;          // ISO
    updatedAt?: string;          // ISO
}
