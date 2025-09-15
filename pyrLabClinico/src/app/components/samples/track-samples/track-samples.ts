import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

import { OrdersService } from '../../../services/order-service';
import { SamplesService } from '../../../services/sample-service';

import { OrderI } from '../../../models/order-model';
import { SampleI, SampleState } from '../../../models/sample-model';

@Component({
  selector: 'app-track-samples',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule, CheckboxModule, TagModule, ButtonModule,
    DialogModule, TextareaModule, FormsModule
  ],
  templateUrl: './track-samples.html'
})
export class TrackSamples {
  private ordersSvc = inject(OrdersService);
  private samplesSvc = inject(SamplesService);
  private fb = inject(FormBuilder);

  /** Flujo secuencial (sin ramas) */
  readonly flow: SampleState[] = ['RECOLECTADA', 'ENVIADA', 'EN_PROCESO', 'EVALUADA'];

  /** Diálogo de rechazo */
  rejectVisible = false;
  rejectingSample?: SampleI;
  rejectForm = this.fb.group({
    observations: this.fb.control<string>('', { validators: [Validators.required] })
  });

  /** Agrupar muestras por orden */
  readonly groups$ = combineLatest([
    this.ordersSvc.orders$,
    this.samplesSvc.items$
  ]).pipe(
    map(([orders, samples]) => {
      const withSamples = orders
        .map(o => ({ order: o, samples: samples.filter(s => s.orderId === o.id) }))
        .filter(g => g.samples.length > 0);
      return withSamples.sort((a, b) =>
        (b.order.orderDate ?? '').localeCompare(a.order.orderDate ?? '')
      );
    })
  );

  // ===== Lógica de pasos =====
  isStepChecked(sample: SampleI, step: SampleState): boolean {
    if (sample.state === 'RECHAZADA' || sample.state === 'ANULADA') return false;
    const idxCurrent = this.flow.indexOf(sample.state);
    const idxStep = this.flow.indexOf(step);
    return idxStep !== -1 && idxCurrent >= idxStep;
  }

  onToggleStep(sample: SampleI, step: SampleState, checked: boolean) {
    if (!sample.id || sample.state === 'RECHAZADA' || sample.state === 'ANULADA') return;
    if (checked) {
      this.samplesSvc.update(sample.id, { state: step }).subscribe();
    } else {
      const idx = this.flow.indexOf(step);
      const prev = idx > 0 ? this.flow[idx - 1] : 'RECOLECTADA';
      this.samplesSvc.update(sample.id, { state: prev }).subscribe();
    }
  }

  // ===== Rechazo con motivo =====
  onToggleRejected(sample: SampleI, checked: boolean) {
    if (!sample.id) return;
    if (checked) {
      // Abrimos diálogo para capturar motivo
      this.openRejectDialog(sample, /*prefill*/ '');
    } else {
      // Quitar rechazo → volver a RECOLECTADA (conservamos observaciones existentes)
      this.samplesSvc.update(sample.id, { state: 'RECOLECTADA' }).subscribe();
    }
  }

  openRejectDialog(sample: SampleI, prefill: string) {
    this.rejectingSample = sample;
    this.rejectForm.reset({ observations: prefill || '' });
    this.rejectVisible = true;
  }

  editRejectReason(sample: SampleI) {
    // Editar razón existente si ya estaba rechazada
    const current = (sample.observations ?? '').trim();
    this.openRejectDialog(sample, current);
  }

  confirmReject() {
    if (!this.rejectingSample?.id) return;
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    const reason = (this.rejectForm.controls.observations.value ?? '').trim();

    // Puedes personalizar si quieres preservar historial:
    // const existing = (this.rejectingSample.observations ?? '').trim();
    // const observations = existing
    //   ? `${existing}\nRechazo: ${reason}`
    //   : `Rechazo: ${reason}`;

    const observations = reason; // simple: reemplaza por el motivo actual

    this.samplesSvc
      .update(this.rejectingSample.id, { state: 'RECHAZADA', observations })
      .subscribe(() => {
        this.rejectVisible = false;
        this.rejectingSample = undefined;
      });
  }

  cancelReject() {
    this.rejectVisible = false;
    this.rejectingSample = undefined;
  }

  // ===== UI helpers =====
  finalLabel(s: SampleI): string {
    switch (s.state) {
      case 'EVALUADA':  return 'Evaluada';
      case 'RECHAZADA': return 'Rechazada';
      case 'ANULADA':   return 'Anulada';
      default:          return 'En curso';
    }
  }

  finalSeverity(s: SampleI): 'success'|'danger'|'warning'|'info' {
    switch (s.state) {
      case 'EVALUADA':  return 'success';
      case 'RECHAZADA':
      case 'ANULADA':   return 'danger';
      case 'EN_PROCESO':return 'warning';
      default:          return 'info';
    }
  }

  stepLabel(s: SampleState): string {
    switch (s) {
      case 'RECOLECTADA': return 'Recolectada';
      case 'ENVIADA':     return 'Enviada';
      case 'EN_PROCESO':  return 'En proceso';
      case 'EVALUADA':    return 'Evaluada';
      default:            return s;
    }
  }

  canInteract(s: SampleI): boolean {
    return s.state !== 'ANULADA';
  }

  orderTitle(o: OrderI): string {
    const p = o.patient;
    const name = p ? `${p.lastName ?? ''}, ${p.firstName ?? ''}`.trim() : '—';
    return `ORD-${o.id} · ${name}`;
  }
}
