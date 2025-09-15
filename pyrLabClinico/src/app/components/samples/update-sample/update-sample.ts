import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { SamplesService } from '../../../services/sample-service';
import { OrdersService } from '../../../services/order-service';
import { ExamsService } from '../../../services/exam-service';

import { SampleI, SampleState } from '../../../models/sample-model';
import { SpecimenType, ExamI } from '../../../models/exam-model';
import { OrderI } from '../../../models/order-model';

@Component({
  selector: 'app-update-sample',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, DatePickerModule, SelectModule, TextareaModule, ButtonModule, DividerModule],
  templateUrl: './update-sample.html'
})
export class UpdateSample implements OnInit {
  @Input() sampleId?: number;
  @Output() saved = new EventEmitter<SampleI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private samplesSvc = inject(SamplesService);
  private ordersSvc = inject(OrdersService);
  private examsSvc = inject(ExamsService);

  sample?: SampleI;
  order?: OrderI;
  allExams: ExamI[] = [];
  allowedTipos: SpecimenType[] = [];

  stateOptions: SampleState[] = ['RECOLECTADA', 'EN_PROCESO', 'RECHAZADA', 'ANULADA'];

  form = this.fb.group({
    orderId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    type:    this.fb.control<SpecimenType | null>(null, { validators: [Validators.required] }),
    barcode: this.fb.control<string>(''),
    drawDate:this.fb.control<Date | null>(null),
    state:   this.fb.control<SampleState>('RECOLECTADA', { nonNullable: true }),
    observations: this.fb.control<string>(''),
  });

  ngOnInit(): void {
    this.examsSvc.list({ status: 'ACTIVE' }).subscribe(xs => this.allExams = xs);

    if (!this.sampleId) return;
    this.samplesSvc.getById(this.sampleId).subscribe(s => {
      this.sample = s;
      if (!s) return;
      this.form.patchValue({
        orderId: s.orderId,
        type: s.type,
        barcode: s.barcode ?? '',
        drawDate: s.drawDate ? new Date(s.drawDate) : null,
        state: s.state,
        observations: s.observations ?? ''
      });

      // cargar orden y tipos permitidos
      this.ordersSvc.getById(s.orderId).subscribe(o => {
        this.order = o;
        this.computeAllowedTipos(o?.id ?? 0, s.type);
      });
    });

    this.form.controls.orderId.valueChanges.subscribe(id => {
      if (id == null) {
        this.order = undefined;
        this.allowedTipos = [];
        this.form.controls.type.setValue(null);
        return;
      }
      this.ordersSvc.getById(id).subscribe(o => {
        this.order = o;
        this.computeAllowedTipos(o?.id ?? 0, this.form.controls.type.value ?? undefined);
      });
    });
  }

  private computeAllowedTipos(orderId: number, keepIfMissing?: SpecimenType): void {
    const currentOrder = this.order;
    if (!currentOrder) {
      this.allowedTipos = keepIfMissing ? [keepIfMissing] : [];
      return;
    }

    const examIds = (currentOrder.items ?? []).map(it => it.examId);
    const tipos = examIds
      .map(id => this.allExams.find(e => e.id === id)?.specimenType)
      .filter((t): t is SpecimenType => !!t);

    const set = new Set<SpecimenType>(tipos);
    if (keepIfMissing && !set.has(keepIfMissing)) set.add(keepIfMissing);

    this.allowedTipos = Array.from(set).sort();

    const current = this.form.controls.type.value;
    if (!current || !this.allowedTipos.includes(current)) {
      this.form.controls.type.setValue(null);
    }
  }

  save(): void {
    if (!this.sample?.id) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    const patch: Partial<SampleI> = {
      orderId: v.orderId!,
      type: v.type!,
      barcode: v.barcode || undefined,
      drawDate: v.drawDate ? v.drawDate.toISOString() : undefined,
      state: v.state ?? 'RECOLECTADA',
      observations: v.observations || undefined
    };

    this.samplesSvc.update(this.sample.id, patch).subscribe(updated => {
      if (updated) this.saved.emit(updated); // <-- tipos alineados
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
