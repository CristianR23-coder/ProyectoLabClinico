import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';

import { OrdersService } from '../../../services/order-service';
import { OrderI, OrderState } from '../../../models/order-model';

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, TagModule, DividerModule, ButtonModule],
  templateUrl: './view-order.html'
})
export class ViewOrder implements OnInit, OnDestroy {
  @Input() orderId?: number;              // si se usa en diálogo
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();
  order?: OrderI;
  loading = true;

  private route = inject(ActivatedRoute);
  private ordersSvc = inject(OrdersService);

  ngOnInit(): void {
    if (this.orderId == null) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.orderId = idParam ? Number(idParam) : undefined;
    }
    if (!this.orderId || Number.isNaN(this.orderId)) {
      this.loading = false;
      return;
    }
    this.ordersSvc.getById(this.orderId).subscribe(ord => {
      this.order = ord;
      this.loading = false;
    });
  }

  ngOnDestroy(): void {}

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

  fullName(o?: OrderI): string {
    const p = o?.patient;
    return p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
  }

  onEdit() {
    if (this.order?.id) this.editRequested.emit(this.order.id);
  }
  onDelete() {
    if (this.order?.id) this.deleteRequested.emit(this.order.id);
  }

  // Conveniencia para deshabilitar "Editar" según negocio
  get disableEdit(): boolean {
    const s = this.order?.state;
    return s === 'ENTREGADA' || s === 'ANULADA' /* || s === 'VALIDADA' */;
  }
}
