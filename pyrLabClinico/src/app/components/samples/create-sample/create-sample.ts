// src/app/components/samples/create-sample/create-sample.ts
import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

import { SamplesService } from '../../../services/sample-service';
import { OrdersService } from '../../../services/order-service';
import { ExamsService } from '../../../services/exam-service';

import { SampleI, SampleState } from '../../../models/sample-model';
import { OrderI } from '../../../models/order-model';
import { ExamI, SpecimenType } from '../../../models/exam-model';

@Component({
  selector: 'app-create-sample',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, DatePickerModule, SelectModule, TextareaModule,
    ButtonModule, DividerModule, TagModule
  ],
  templateUrl: './create-sample.html'
})
export class CreateSample implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private svc = inject(SamplesService);
  private ordersSvc = inject(OrdersService);
  private examsSvc = inject(ExamsService);

  readonly fixedState: SampleState = 'RECOLECTADA';

  @Output() created = new EventEmitter<SampleI>();
  @Output() cancelled = new EventEmitter<void>();

  // Catálogos / cache
  orders: OrderI[] = [];
  allExams: ExamI[] = [];

  // Opciones para selects (label/value)
  ordersOptions: { label: string; value: number }[] = [];
  allowedTipos: { label: string; value: SpecimenType }[] = [];

  // Subscriptions
  private subs: Subscription[] = [];

  // Formulario
  form = this.fb.group({
    orderId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    type: this.fb.control<SpecimenType | null>(null, { validators: [Validators.required] }),
    barcode: this.fb.control<string>(''),
    drawDate: this.fb.control<Date | null>(new Date()),
    state:      this.fb.control<SampleState | null>('RECOLECTADA', { nonNullable: true }),
    observations: this.fb.control<string>(''),
  });

  ngOnInit(): void {
    // Cargar órdenes y armar opciones
    this.subs.push(
      this.ordersSvc.orders$.subscribe(os => {
        this.orders = os ?? [];
        this.ordersOptions = (os ?? []).map(o => ({
          label: `ORD-${o.id} · ${o.patient?.lastName}, ${o.patient?.firstName}`,
          value: o.id!
        }));
      })
    );

    // Cargar exámenes (para specimenType de cada examen)
    this.subs.push(
      this.examsSvc.exams$.subscribe((xs: ExamI[]) => {
        this.allExams = xs ?? [];
        // Si ya hay orderId seleccionado, recalculamos
        const currentOrderId = this.form.controls.orderId.value;
        if (currentOrderId) this.computeAllowedTipos(currentOrderId);
      })
    );

    // Recalcular tipos cuando cambia la orden
    this.subs.push(
      this.form.controls.orderId.valueChanges.subscribe(id => {
        this.onOrderChange(id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // Cuando cambia la orden, recalculamos los tipos disponibles
  onOrderChange(id: number | null) {
    if (!id) {
      this.allowedTipos = [];
      this.form.controls.type.setValue(null);
      return;
    }
    this.computeAllowedTipos(id, this.form.controls.type.value ?? undefined);
  }

  private computeAllowedTipos(orderId: number, keepIfMissing?: SpecimenType) {
    const order = this.orders.find(o => o.id === orderId);
    const examIds = (order?.items ?? []).map(it => it.examId);

    const tipos = examIds
      .map(id => this.allExams.find(e => e.id === id)?.specimenType)
      .filter((t): t is SpecimenType => !!t);

    const set = new Set<SpecimenType>(tipos);
    if (keepIfMissing && !set.has(keepIfMissing)) set.add(keepIfMissing);

    const toLabel = (t: SpecimenType) =>
      t === 'SANGRE' ? 'Sangre' :
      t === 'SUERO'  ? 'Suero'  :
      t === 'PLASMA' ? 'Plasma' :
      t === 'ORINA'  ? 'Orina'  :
      t === 'SALIVA' ? 'Saliva' :
      t === 'HECES'  ? 'Heces'  :
      t === 'TEJIDO' ? 'Tejido' : 'Otra';

    this.allowedTipos = Array.from(set)
      .sort()
      .map(t => ({ label: toLabel(t), value: t }));

    // si el valor actual ya no es válido, se limpia
    const current = this.form.controls.type.value;
    if (!current || !this.allowedTipos.some(o => o.value === current)) {
      this.form.controls.type.setValue(null);
    }
  }

  // Guardar
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    const payload: Omit<SampleI, 'id'> = {
      orderId: v.orderId!,
      type: v.type!,                    // ya validado por required
      barcode: v.barcode || undefined,
      drawDate: v.drawDate ? v.drawDate.toISOString() : undefined,
      state: v.state ?? 'RECOLECTADA',
      observations: v.observations || undefined
    };

    this.svc.add(payload).subscribe(newSample => this.created.emit(newSample));
  }

  cancel(): void { this.cancelled.emit(); }
}
