import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

/* ====== Tipos compatibles con tus componentes previos ====== */
export type OrderStatus =
  'pendiente' | 'en-proceso' | 'completada' | 'reportada' | 'cancelada';

export interface OrderBase {
  id: string;
  numero: string;
  paciente: string;
  medico: string;
  fechaCreacion: string | Date;
  estado: OrderStatus;
  pruebas: number;
  total: number;
}

export interface Sample {
  tipo: string;
  codigoBarra?: string | null;
  fechaToma?: string | Date | null;
  observacion?: string | null;
}

export interface OrderExam {
  examenId: string;
  codigo?: string;         // ej. GLU
  nombre: string;          // ej. Glucosa
  precio?: number;
  panelId?: string | null;
  estado?: 'pendiente' | 'en-proceso' | 'listo';
}

export interface ResultItem {
  examen?: string;         // ej. Glucosa
  parametro: string;       // ej. Valor
  resultado: string | number;
  unidad?: string;
  referencia?: string;
  flag?: 'H' | 'L' | 'N';  // Alto/Bajo/Normal
}

/** Orden con detalle (lo que visualizará el componente) */
export interface OrderDetail extends OrderBase {
  pacienteDoc?: string;
  pacienteEdad?: number;
  aseguradora?: string | null;
  observaciones?: string;
  muestras?: Sample[];
  examenes?: OrderExam[];
  resultados?: ResultItem[];
}

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule, ButtonModule, TagModule, DividerModule, TableModule, TooltipModule,
  ],
  templateUrl: './view-order.html',
  styleUrls: ['./view-order.css'],
})
export class ViewOrder {
  /* ====== Inputs / Outputs ====== */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Orden a mostrar */
  @Input() order: OrderDetail | null = null;

  /** Moneda para totales */
  @Input() currencyCode = 'COP';

  /** Para evitar problemas de overlay en contenedores: */
  @Input() appendToBody = true;

  /** Acciones opcionales */
  @Output() edit = new EventEmitter<OrderDetail>();
  @Output() print = new EventEmitter<OrderDetail>();
  @Output() close = new EventEmitter<void>();

  /* ====== Helpers ====== */
  getStatusSeverity(s: OrderStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (s) {
      case 'completada':
      case 'reportada':  return 'success';
      case 'en-proceso': return 'info';
      case 'pendiente':  return 'warn';
      case 'cancelada':  return 'danger';
    }
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  onEdit() {
    if (this.order) this.edit.emit(this.order);
  }

  onPrint() {
    if (this.order) this.print.emit(this.order);
  }

  /** Sumas por si vienen sin calcular */
  get totalPruebas(): number {
    if (this.order?.examenes?.length) return this.order.examenes.length;
    return this.order?.pruebas ?? 0;
  }
  get totalValor(): number {
    if (!this.order?.examenes?.length) return this.order?.total ?? 0;
    return this.order.examenes.reduce((acc, e) => acc + (e.precio ?? 0), 0);
  }
}
