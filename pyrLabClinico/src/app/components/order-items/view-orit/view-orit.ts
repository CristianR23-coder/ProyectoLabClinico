import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { OrdersService } from '../../../services/order-service';
import { OrderI, OrderState } from '../../../models/order-model';
import { OrderItemI, OrderItemState } from '../../../models/order-item-model';

// ⬇️ Servicio de exámenes para leer el estado ACTIVE/INACTIVE
import { ExamsService } from '../../../services/exam-service'; // ⚠️ ajusta la ruta si tu árbol difiere

@Component({
  selector: 'app-view-orit',
  standalone: true,
  imports: [CommonModule, CardModule, TagModule, DividerModule, ButtonModule, TableModule],
  templateUrl: './view-orit.html'
})
export class ViewOrIt implements OnInit {
  @Input() orderId?: number;

  // Si sigues usando estos outputs desde el padre, los dejamos:
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();

  private ordersSvc = inject(OrdersService);
  private examsSvc  = inject(ExamsService);

  order?: OrderI;
  loading = true;

  /** Cache: examId -> 'ACTIVE' | 'INACTIVE' */
  examStatusMap = new Map<number, 'ACTIVE' | 'INACTIVE'>();

  ngOnInit(): void {
    if (!this.orderId || Number.isNaN(this.orderId)) {
      this.loading = false;
      return;
    }
    this.ordersSvc.getById(this.orderId).subscribe(o => {
      this.order = o;
      this.loading = false;
      this.preloadExamStatuses();
    });
  }

  /** Precarga el estado de todos los examenes presentes en la orden */
  private preloadExamStatuses(): void {
    const ids = Array.from(
      new Set((this.order?.items ?? []).map(i => i.examId).filter((x): x is number => !!x))
    );
    ids.forEach(id => {
      // Si ya está cacheado, no vuelvas a consultar
      if (this.examStatusMap.has(id)) return;
      this.examsSvc.getById(id).subscribe(ex => {
        if (ex?.status) this.examStatusMap.set(id, ex.status);
      });
    });
  }

  // --- acciones que EMITEN ID (si las usas en el padre) ---
  onEdit(): void {
    if (this.order?.id) this.editRequested.emit(this.order.id);
  }
  onDelete(): void {
    if (this.order?.id) this.deleteRequested.emit(this.order.id);
  }

  // --- helpers UI (orden) ---
  tagSeverity(s?: OrderState): 'info'|'warning'|'success'|'danger'|'help'|'warn'|undefined {
    switch (s) {
      case 'CREADA': return 'info';
      case 'TOMADA':
      case 'EN_PROCESO': return 'warn';
      case 'VALIDADA':
      case 'ENTREGADA': return 'success';
      case 'ANULADA': return 'danger';
      default: return undefined;
    }
  }

  // --- helpers UI (ítems) ---
  itemSeverity(s?: OrderItemState): 'info'|'warning'|'success'|'danger'|undefined {
    switch (s) {
      case 'PENDIENTE': return 'info';
      case 'TOMADO':
      case 'EN_PROCESO': return 'warning';
      case 'VALIDADO':
      case 'ENTREGADO': return 'success';
      case 'ANULADO': return 'danger';
      default: return undefined;
    }
  }

  /** Estado del EXAMEN para un ítem (ACTIVE/INACTIVE) */
  examStatus(it: OrderItemI): 'ACTIVE' | 'INACTIVE' | undefined {
    return this.examStatusMap.get(it.examId);
  }
  examStatusSeverity(st?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | 'info' | undefined {
    if (!st) return undefined;
    return st === 'ACTIVE' ? 'success' : 'danger';
  }

  fullName(): string {
    const p = this.order?.patient;
    return p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
  }

  examCount(): number {
    return (this.order?.items ?? []).length;
  }
  sumItems(): number {
    return (this.order?.items ?? []).reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  }

  get locked(): boolean {
    const s = this.order?.state;
    return s === 'ENTREGADA' || s === 'ANULADA';
  }

  removeItem(it: OrderItemI): void {
    if (!this.order?.id || !it.id) return;
    const ok = confirm(`¿Quitar el examen ${it.code} de la orden #${this.order.id}?`);
    if (!ok) return;
    this.ordersSvc.removeItem(this.order.id, it.id).subscribe(o => {
      this.order = o; // refresca la tabla
      this.preloadExamStatuses(); // por si cambió la lista
    });
  }
}
