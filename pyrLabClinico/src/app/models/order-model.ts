// src/app/ordenes/model.ts
import { PatientI } from "../models/patient-model";
import { DoctorI } from "../models/doctor-model";
import { InsuranceI } from "../models/insurance-model";
import { OrderItemI } from "./order-item-model";

// Interface definition for OrderI
export interface OrderI {
  id?: number; // Optional identifier
  orderDate: string; // Fecha de creación (ISO string)
  state: OrderState;
  priority: "RUTINA" | "URGENTE";

  patient: PatientI; // Información del paciente relacionado
  doctor?: DoctorI;    // Información del médico (puede ser null/undefined)
  insurance?: InsuranceI; // Información de la aseguradora (puede ser null/undefined)

  netTotal: number;   // Valor total de la orden
  observations?: string; // Comentarios adicionales

  status: "ACTIVE" | "INACTIVE"; // Estado de la orden en el sistema

  items?: OrderItemI[];
}

export type OrderState =
  | "CREADA" | "TOMADA" | "EN_PROCESO"
  | "VALIDADA" | "ENTREGADA" | "ANULADA";
