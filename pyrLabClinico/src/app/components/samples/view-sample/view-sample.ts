import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

import { SamplesService } from '../../../services/sample-service';
import { OrdersService } from '../../../services/order-service';

import { SampleI } from '../../../models/sample-model';
import { OrderI } from '../../../models/order-model';
import { SpecimenType } from '../../../models/exam-model';

@Component({
  selector: 'app-view-sample',
  standalone: true,
  imports: [CommonModule, DialogModule, CardModule, DividerModule, TagModule, ButtonModule],
  templateUrl: './view-sample.html'
})
export class ViewSample implements OnInit {
  private samplesSvc = inject(SamplesService);
  private ordersSvc = inject(OrdersService);

  /** Modo diálogo */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Contenido / referencia */
  @Input() sample?: SampleI | null;
  @Input() sampleId?: number | null;

  /** Opcional: forzar appendTo="body" en el diálogo */
  @Input() appendToBody = false;

  /** Eventos para acciones (el padre decide qué hacer) */
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  loading = true;
  order?: OrderI;

  ngOnInit(): void {
    if (this.sample) {
      this.loading = false;
      this.loadOrder(this.sample.orderId);
      return;
    }

    const id = this.sampleId;
    if (!id) {
      this.loading = false;
      return;
    }

    this.samplesSvc.getById(id).subscribe(s => {
      this.sample = s ?? undefined;
      this.loading = false;
      if (s) this.loadOrder(s.orderId);
    });
  }

  private loadOrder(orderId?: number) {
    if (!orderId) return;
    this.ordersSvc.getById(orderId).subscribe(o => (this.order = o ?? undefined));
  }

  // ===== UI helpers =====
  tagSeverity(state?: string): 'info' | 'success' | 'warning' | 'danger' | undefined {
    switch (state) {
      case 'RECOLECTADA': return 'info';
      case 'EN_PROCESO':  return 'warning';
      case 'EVALUADA':    return 'success';
      case 'RECHAZADA':
      case 'ANULADA':     return 'danger';
      default:            return undefined;
    }
  }

  specimenLabel(t?: SpecimenType): string {
    switch (t) {
      case 'SANGRE': return 'Sangre';
      case 'SUERO':  return 'Suero';
      case 'PLASMA': return 'Plasma';
      case 'ORINA':  return 'Orina';
      case 'SALIVA': return 'Saliva';
      case 'HECES':  return 'Heces';
      case 'TEJIDO': return 'Tejido';
      case 'OTRA':   return 'Otra';
      default:       return '—';
    }
  }

  patientName(): string {
    const p = this.order?.patient;
    return p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
    }

  // ===== acciones =====
  onEdit(): void {
    if (this.sample?.id) this.editRequested.emit(this.sample.id);
  }

  onDelete(): void {
    if (this.sample?.id) this.deleteRequested.emit(this.sample.id);
  }

  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }

  get appendToTarget(): any {
    return this.appendToBody ? 'body' : null;
  }
}
