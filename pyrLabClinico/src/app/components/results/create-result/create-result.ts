import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DatePickerModule } from 'primeng/datepicker';

import { ResultsService } from '../../../services/result-service';
import { OrdersService } from '../../../services/order-service';
import { SamplesService } from '../../../services/sample-service';
import { ExamsService } from '../../../services/exam-service';
import { ParameterService } from '../../../services/parameter-service';

import { ResultI, ResultState } from '../../../models/result-model';
import { OrderI } from '../../../models/order-model';
import { SampleI } from '../../../models/sample-model';
import { ExamI } from '../../../models/exam-model';
import { ParameterI, TypeValue } from '../../../models/parameter-model';

@Component({
  selector: 'app-create-result',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, TextareaModule, ButtonModule, DividerModule,
    DatePickerModule
  ],
  templateUrl: './create-result.html'
})
export class CreateResult implements OnInit {
  /** Contexto opcional, si el padre ya lo conoce */
  @Input() orderId?: number | null;
  @Input() sampleId?: number | null;
  @Input() examId?: number | null;

  @Output() saved = new EventEmitter<ResultI>();
  @Output() cancelled = new EventEmitter<void>();

  // servicios
  private fb = inject(FormBuilder);
  private resultsSvc = inject(ResultsService);
  private ordersSvc = inject(OrdersService);
  private samplesSvc = inject(SamplesService);
  private examsSvc = inject(ExamsService);
  private paramsSvc = inject(ParameterService);

  // estado UI
  loading = true;

  // catálogos / opciones
  orders: OrderI[] = [];
  allowedSamples: SampleI[] = [];
  allowedExams: ExamI[] = [];
  allowedParams: ParameterI[] = [];

  // entidades derivadas
  order?: OrderI;
  exam?: ExamI;
  param: ParameterI | null = null;

  readonly fixedState: ResultState = 'PENDIENTE';

  // Form A-L-I-N-E-A-D-O a tu modelo ResultI
  form = this.fb.group({
    orderId:        this.fb.control<number | null>(null, { validators: [Validators.required] }),
    sampleId:       this.fb.control<number | null>(null, { validators: [Validators.required] }),
    examId:         this.fb.control<number | null>(null, { validators: [Validators.required] }),
    parameterId:    this.fb.control<number | null>(null, { validators: [Validators.required] }),

    numValue:       this.fb.control<number | null>(null),
    textValue:      this.fb.control<string | null>(null),
    units:          this.fb.control<string | null>(null),
    comment:        this.fb.control<string | null>(null),

    dateResult:     this.fb.control<Date | null>(new Date()),
    resultState:    [{ value: 'PENDIENTE', disabled: true }],

    validatedForId: this.fb.control<number | null>(null)
  });

  ngOnInit(): void {
    // 1) Cargar órdenes para el selector
    this.loadOrders();

    // 2) Hydrate por @Input (si vienen del padre)
    if (this.orderId != null) this.form.controls.orderId.setValue(this.orderId);
    if (this.sampleId != null) this.form.controls.sampleId.setValue(this.sampleId);
    if (this.examId   != null) this.form.controls.examId.setValue(this.examId);

    // 3) Reaccionar a cambios de orderId -> carga samples + exams de la orden
    this.form.controls.orderId.valueChanges.subscribe(id => {
      // reset dependientes
      this.form.patchValue({ sampleId: null, examId: null, parameterId: null });
      this.allowedSamples = [];
      this.allowedExams = [];
      this.allowedParams = [];
      this.order = undefined;
      this.exam = undefined;
      this.param = null;

      if (!id) { this.loading = false; return; }
      this.loadOrderContext(id);
    });

    // si ya hay orderId desde @Input dispara flujo
    if (this.form.controls.orderId.value) {
      this.loadOrderContext(this.form.controls.orderId.value!);
    } else {
      this.loading = false;
    }

    // 4) Reaccionar a cambios de examId -> carga parámetros
    this.form.controls.examId.valueChanges.subscribe(exId => {
      this.form.patchValue({ parameterId: null });
      this.allowedParams = [];
      this.exam = undefined;
      this.param = null;

      if (!exId) return;

      const local = this.allowedExams.find(e => e.id === exId);
      if (local) this.exam = local;
      else this.examsSvc.getById(exId).subscribe(e => (this.exam = e ?? undefined));

      this.paramsSvc.listByExam(exId).subscribe(list => {
        this.allowedParams = list;
        if (list.length === 1) {
          const only = list[0];
          this.form.patchValue({ parameterId: only.id!, units: only.unit ?? null });
          this.param = only;
        }
      });
    });

    // 5) Reaccionar a cambios de parameterId -> set `param` y autocompletar units
    this.form.controls.parameterId.valueChanges.subscribe(pid => {
      if (!pid) { this.param = null; return; }
      const local = this.allowedParams.find(p => p.id === pid);
      if (local) {
        this.param = local;
        if (!this.form.value.units && local.unit) this.form.patchValue({ units: local.unit });
      } else {
        this.paramsSvc.getById(pid).subscribe(p => {
          this.param = p ?? null;
          if (!this.form.value.units && p?.unit) this.form.patchValue({ units: p.unit });
        });
      }
    });
  }

  // --- helpers de carga ---
  private loadOrders(): void {
    const s: any = this.ordersSvc as any;

    // detecta la API disponible
    const orders$ =
      typeof s.list === 'function' ? s.list() :
      s.orders$ ? s.orders$ :
      s.items$ ? s.items$ :
      of([] as OrderI[]);

    orders$.subscribe((arr: OrderI[]) => {
      this.orders = (arr || []).slice().sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    });
  }

  private loadOrderContext(orderId: number): void {
    this.loading = true;

    // detalle de la orden (paciente, items, etc.)
    this.ordersSvc.getById(orderId).subscribe(o => {
      this.order = o ?? undefined;

      // muestras de la orden
      if ((this.samplesSvc as any).list) {
        this.samplesSvc.list({ orderId }).subscribe(ss => this.allowedSamples = ss || []);
      } else {
        // fallback: si no hay list(), intentar items$
        const s: any = this.samplesSvc as any;
        const items$ = s.items$ ?? of([]);
        items$.subscribe((all: SampleI[]) => {
          this.allowedSamples = (all || []).filter(x => x.orderId === orderId);
        });
      }

      // exámenes de la orden (desde items)
      const examIds = Array.from(new Set((o?.items ?? []).map(it => it.examId).filter(Boolean)));
      if ((this.examsSvc as any).list) {
        this.examsSvc.list().subscribe((all: ExamI[]) => {
          this.allowedExams = all.filter(e => examIds.includes(e.id!))
                                 .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          this.loading = false;
        });
      } else {
        const s: any = this.examsSvc as any;
        const items$ = s.exams$ ?? s.items$ ?? of([]);
        items$.subscribe((all: ExamI[]) => {
          this.allowedExams = (all || []).filter(e => examIds.includes(e.id!))
                                         .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          this.loading = false;
        });
      }
    });
  }

  // --- acciones ---
  save(): void {
    if (this.form.invalid || !this.param) {
      this.form.markAllAsTouched();
      if (!this.param) alert('Selecciona un parámetro.');
      return;
    }

    const v = this.form.getRawValue();

    // tipo del parámetro
    const isNumeric: boolean = (this.param.typeValue ?? 'NUMERICO') === 'NUMERICO';

    // normalización
    const numValue  = isNumeric ? (v.numValue != null ? Number(v.numValue) : null) : null;
    const textValue = isNumeric ? null : (v.textValue?.trim() || null);

    // fuera de rango
    let outRange: boolean | null = null;
    const min = this.param.refMin ?? null;
    const max = this.param.refMax ?? null;
    if (isNumeric && numValue != null && (min != null || max != null)) {
      outRange = (min != null && numValue < min) || (max != null && numValue > max);
    }

    // método (snapshot del examen)
    const method: string | null = this.exam?.method ?? null;

    // fecha ISO
    const dateResult = (v.dateResult instanceof Date ? v.dateResult : new Date()).toISOString();

    // validación (opcional, puedes mapear nombre si tienes catálogo de doctores)
    const validatedForId = v.validatedForId ?? null;
    const validatedFor: string | null = null;

    const payload: Omit<ResultI, 'id'> = {
      orderId:     Number(v.orderId!),
      sampleId:    Number(v.sampleId!),
      examId:      Number(v.examId!),
      parameterId: Number(v.parameterId!),

      numValue,
      textValue,
      outRange,

      dateResult,
      method,
      units:   v.units ?? null,
      comment: v.comment ?? null,

      resultState: this.fixedState,
      validatedFor,
      validatedForId
    };

    this.resultsSvc.add(payload).subscribe(created => {
      if (created) this.saved.emit(created);
    });
  }

  cancel(): void { this.cancelled.emit(); }
}
