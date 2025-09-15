// esta es la tabla intermedia entre orden y examen

// Interface definition for OrderItemI
export interface OrderItemI {
    id?: number;         // orden_examen_id (PK en backend)
    orderId: number;     // FK -> orden_lab.orden_id
    examId: number;      // FK -> examen.examen_id

    // Datos denormalizados del examen (útiles para mostrar sin re-consulta)
    code: string;        // examen.codigo
    name: string;        // examen.nombre

    price: number;       // precio (por defecto: examen.precio_base, puede ajustarse)
    state: OrderItemState; // estado del ítem (PENDIENTE/TOMADO/EN_PROCESO/VALIDADO/ENTREGADO/ANULADO)
}

export type OrderItemState =
    | 'PENDIENTE'
    | 'TOMADO'
    | 'EN_PROCESO'
    | 'VALIDADO'
    | 'ENTREGADO'
    | 'ANULADO';