import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { OrdersService } from '../../../services/order-service';
import { OrderI, OrderState } from '../../../models/order-model';
import { combineLatest, map, startWith } from 'rxjs';

import { CreateOrder } from '../create-order/create-order';
import { UpdateOrder } from '../update-order/update-order';
import { ViewOrder } from '../view-order/view-order';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule,
    CreateOrder, UpdateOrder, ViewOrder
  ],
  templateUrl: './all-order.html'
})
export class AllOrder {
  private fb = inject(FormBuilder);
  private ordersSvc = inject(OrdersService);
  order?: OrderI;
  @Output() deleteRequested = new EventEmitter<number>();
  showCreate = false;

  // Edit dialog state
  showEdit = false;
  selectedOrderId?: number;

  // View  
  showView = false;
  viewedOrderId?: number;

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

  openCreate() { this.showCreate = true; }
  closeCreate() { this.showCreate = false; }

  onCreatedOrder(_: OrderI) {
    this.showCreate = false; // orders$ se actualiza solo
  }

  openEdit(id: number) {
    this.selectedOrderId = id;
    this.showEdit = true;
  }
  closeEdit() {
    this.showEdit = false;
    this.selectedOrderId = undefined;
  }
  onEditedOrder(_: OrderI) {
    this.closeEdit(); // orders$ se actualiza solo
  }
  // View handlers  ⬇️
  openView(id: number) { this.viewedOrderId = id; this.showView = true; }
  closeView() { this.showView = false; this.viewedOrderId = undefined; }

  clear() { this.form.reset({ q: '', state: undefined }); }

  tagSeverity(s?: OrderState): 'info' | 'warn' | 'success' | 'danger' | undefined {
    switch (s) {
      case 'CREADA': return 'info';
      case 'TOMADA': return 'info';
      case 'EN_PROCESO': return 'warn';
      case 'VALIDADA': return 'success';
      case 'ENTREGADA': return 'success';
      case 'ANULADA': return 'danger';
      default: return undefined;
    }
  }

  fullName(o: OrderI): string {
    const p = o.patient;
    return p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
  }

  private applyFilters(items: OrderI[], params?: { q?: string; state?: OrderState }): OrderI[] {
    let out = items;
    if (params?.state) out = out.filter(r => r.state === params.state);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const idStr = String(r.id ?? '');
        const patient = r.patient ? `${r.patient.firstName} ${r.patient.lastName}`.toLowerCase() : '';
        const doc = r.patient?.docNumber?.toLowerCase() ?? '';
        return idStr.includes(q) || patient.includes(q) || doc.includes(q);
      });
    }
    return [...out].sort((a, b) => (b.orderDate ?? '').localeCompare(a.orderDate ?? ''));
  }

  // ya tenías openEdit/closeEdit
  onViewEdit(id: number) {
    this.closeView();
    this.openEdit(id);
  }

  onViewDelete(id: number) {
    const ok = confirm(`¿Eliminar la orden #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.ordersSvc.remove(id).subscribe((success) => {
      if (success) this.closeView();
      // aquí puedes mostrar un toast si usas MessageService
    });
  }

  onDelete() {
    if (this.order?.id) this.deleteRequested.emit(this.order.id);
  }
}
