// src/app/orders/all-orit/all-orit.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, startWith } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { OrdersService } from '../../../services/order-service';
import { OrderI, OrderState } from '../../../models/order-model';
import { OrderItemI, OrderItemState } from '../../../models/order-item-model';

// vista detalle con su propio diálogo de edición interno
import { ViewOrIt } from '../view-orit/view-orit';

@Component({
  selector: 'app-orders-with-exams',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule,
    ViewOrIt
  ],
  templateUrl: './all-orit.html'
})
export class AllOrIt {
  private fb = inject(FormBuilder);
  private ordersSvc = inject(OrdersService);

  // Dialogo de detalle
  showView = false;
  viewedOrderId?: number;

  // Expansión (si usas rowexpansion)
  expandedRowKeys: { [key: string]: boolean } = {};

  // filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    state: this.fb.control<OrderState | undefined>(undefined)
  });

  readonly rows$ = combineLatest([
    this.ordersSvc.orders$,
    this.form.valueChanges.pipe(startWith(this.form.getRawValue()))
  ]).pipe(
    map(([orders, v]) => this.applyFilters(orders, { q: v.q || undefined, state: v.state || undefined }))
  );

  // abrir/cerrar detalle
  openView(id: number) { this.viewedOrderId = id; this.showView = true; }
  closeView() { this.showView = false; this.viewedOrderId = undefined; }

  clear() { this.form.reset({ q: '', state: undefined }); }

  // helpers de UI
  tagSeverity(s?: OrderState): 'info' | 'warning' | 'success' | 'danger' | 'help' | undefined {
    switch (s) {
      case 'CREADA': return 'info';
      case 'TOMADA': return 'info';
      case 'EN_PROCESO': return 'warning';
      case 'VALIDADA': return 'success';
      case 'ENTREGADA': return 'success';
      case 'ANULADA': return 'danger';
      default: return undefined;
    }
  }
  itemSeverity(s?: OrderItemState): 'info' | 'warning' | 'success' | 'danger' | undefined {
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

  examsCount(o: OrderI): number {
    return (o.items ?? []).length;
  }
  examsCodes(o: OrderI): string {
    const codes = (o.items ?? []).map(i => i.code).filter(Boolean);
    return codes.length ? codes.join(', ') : '—';
    }
  sumItems(o: OrderI): number {
    return (o.items ?? []).reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  }

  deleteOrder(o: OrderI) {
    if (!o.id) return;
    const ok = confirm(`¿Eliminar la orden #${o.id}?`);
    if (!ok) return;
    this.ordersSvc.remove(o.id).subscribe();
  }

  removeItem(o: OrderI, it: OrderItemI) {
    if (!o.id || !it.id) return;
    const ok = confirm(`¿Quitar el examen ${it.code} de la orden #${o.id}?`);
    if (!ok) return;
    this.ordersSvc.removeItem(o.id, it.id).subscribe();
  }

  // tabla
  private applyFilters(items: OrderI[], params?: { q?: string; state?: OrderState }): OrderI[] {
    let out = items;

    if (params?.state) out = out.filter(r => r.state === params.state);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const idStr = String(r.id ?? '');
        const patient = r.patient ? `${r.patient.firstName} ${r.patient.lastName}`.toLowerCase() : '';
        const doc = r.patient?.docNumber?.toLowerCase() ?? '';
        const examCodeHit = (r.items ?? []).some(it => it.code?.toLowerCase().includes(q));
        const examNameHit = (r.items ?? []).some(it => it.name?.toLowerCase().includes(q));
        return idStr.includes(q) || patient.includes(q) || doc.includes(q) || examCodeHit || examNameHit;
      });
    }

    return [...out].sort((a, b) => (b.orderDate ?? '').localeCompare(a.orderDate ?? ''));
  }
}
