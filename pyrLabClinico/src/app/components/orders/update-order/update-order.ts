import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { OrdersService } from '../../../services/order-service';                 // ← ajusta si difiere (p.ej. '../../../services/order-service')
import { ExamsService } from '../../../services/exam-service';         // ← ajusta si difiere
import { OrderI, OrderState } from '../../../models/order-model';
import { PatientI } from '../../../models/patient-model';
import { DoctorI } from '../../../models/doctor-model';
import { InsuranceI } from '../../../models/insurance-model';
import { OrderItemI } from '../../../models/order-item-model';
import { ExamI } from '../../../models/exam-model';

@Component({
  selector: 'app-edit-order',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    InputTextModule, DatePickerModule, SelectModule, TextareaModule,
    ButtonModule, DividerModule, TableModule, TagModule
  ],
  templateUrl: './update-order.html'
})
export class UpdateOrder implements OnInit, OnDestroy {
  @Input() orderId?: number;
  @Output() saved = new EventEmitter<OrderI>();
  @Output() cancelled = new EventEmitter<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ordersSvc = inject(OrdersService);
  private examsSvc = inject(ExamsService);

  private sub?: Subscription;
  loading = true;
  saving = false;
  order?: OrderI;

  // catálogos demo
  patients: PatientI[] = [
    { id: 501, docType: 'CC', docNumber: '123456', firstName: 'Ana', lastName: 'Perez', status: 'ACTIVE' },
    { id: 502, docType: 'CC', docNumber: '789012', firstName: 'Luis', lastName: 'Gomez', status: 'ACTIVE' }
  ];
  doctors: DoctorI[] = [
    { id: 80, docNumber: 'M-998', name: 'Dr. Lopez', status: 'ACTIVE' },
    { id: 81, docNumber: 'M-777', name: 'Dr. Ruiz', status: 'ACTIVE' }
  ];
  insurances: InsuranceI[] = [
    { id: 7, name: 'Health Plus', nit: '900.123.456', status: 'ACTIVE' },
    { id: 8, name: 'Care One', nit: '901.777.111', status: 'ACTIVE' }
  ];

  // catálogo de exámenes
  examsAll: ExamI[] = [];

  priorityOptions = [
    { label: 'Rutina', value: 'RUTINA' as const },
    { label: 'Urgente', value: 'URGENTE' as const }
  ];
  stateOptions: { label: string; value: OrderState }[] = [
    { label: 'Creada', value: 'CREADA' },
    { label: 'Tomada', value: 'TOMADA' },
    { label: 'En proceso', value: 'EN_PROCESO' },
    { label: 'Validada', value: 'VALIDADA' },
    { label: 'Entregada', value: 'ENTREGADA' },
    { label: 'Anulada', value: 'ANULADA' },
  ];

  // 🔑 Form reactivo (sin netTotal porque se calcula)
  form = this.fb.group({
    patientId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    doctorId: this.fb.control<number | null>(null),
    insuranceId: this.fb.control<number | null>(null),

    priority: this.fb.control<'RUTINA' | 'URGENTE'>('RUTINA', { nonNullable: true }),
    state: this.fb.control<OrderState>('CREADA', { nonNullable: true }),

    orderDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    observations: this.fb.control<string>(''),

    status: this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true }),

    // ← Control para AGREGAR examen (reemplaza [(ngModel)])
    examToAddId: this.fb.control<number | null>(null)
  });

  ngOnInit(): void {
    // cargar exámenes
    this.examsSvc.list().subscribe(list => (this.examsAll = list));

    if (this.orderId == null) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.orderId = idParam ? Number(idParam) : undefined;
    }
    if (!this.orderId || Number.isNaN(this.orderId)) {
      this.loading = false;
      return;
    }

    this.sub = this.ordersSvc.getById(this.orderId).subscribe(ord => {
      this.order = ord;
      this.loading = false;
      if (ord) this.patchForm(ord);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private patchForm(o: OrderI) {
    this.form.reset({
      patientId: o.patient?.id ?? null,
      doctorId: o.doctor?.id ?? null,
      insuranceId: o.insurance?.id ?? null,
      priority: o.priority,
      state: o.state,
      orderDate: o.orderDate ? new Date(o.orderDate) : null,
      observations: o.observations ?? '',
      status: o.status ?? 'ACTIVE',
      examToAddId: null
    });

    if (this.disableAllEdits) {
      this.form.disable({ emitEvent: false });
    }
  }

  save(): void {
    if (!this.order?.id) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    const patientId = Number(v.patientId);
    const doctorId = v.doctorId != null ? Number(v.doctorId) : undefined;
    const insuranceId = v.insuranceId != null ? Number(v.insuranceId) : undefined;

    const patient = this.patients.find(p => p.id === patientId)!;
    const doctor = doctorId ? this.doctors.find(d => d.id === doctorId) : undefined;
    const insurance = insuranceId ? this.insurances.find(i => i.id === insuranceId) : undefined;

    const dateVal = v.orderDate instanceof Date ? v.orderDate : new Date(v.orderDate as any);

    const patch: Partial<OrderI> = {
      patient, doctor, insurance,
      priority: v.priority ?? 'RUTINA',
      state: v.state ?? 'CREADA',
      orderDate: dateVal.toISOString(),
      observations: v.observations || undefined,
      status: v.status ?? 'ACTIVE',
    };

    this.saving = true;
    this.ordersSvc.update(this.order.id, patch).subscribe(updated => {
      this.saving = false;
      if (updated) this.saved.emit(updated);
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  // ——— Exámenes ———
  get availableExams(): ExamI[] {
    // Solo activos para agregar:
    return this.examsAll.filter(x => x.status === 'ACTIVE');
  }

  addExam() {
    if (!this.order?.id) return;
    const id = this.form.controls.examToAddId.value;
    if (!id) return;

    const exam = this.examsAll.find(e => e.id === id);
    if (!exam) return;

    this.ordersSvc.addItem(this.order.id, exam).subscribe(ord => {
      if (ord) {
        this.order = ord;
        this.form.controls.examToAddId.setValue(null); // limpiar selector
      }
    });
  }

  removeItem(it: OrderItemI) {
    if (!this.order?.id || !it.id) return;
    const ok = confirm(`¿Quitar el examen ${it.code} de la orden #${this.order.id}?`);
    if (!ok) return;
    this.ordersSvc.removeItem(this.order.id, it.id).subscribe(ord => {
      if (ord) this.order = ord;
    });
  }

  // Estado del EXAMEN (ACTIVE/INACTIVE) para mostrar
  examStatusOf(it: OrderItemI): 'ACTIVE' | 'INACTIVE' | undefined {
    return this.examsAll.find(e => e.id === it.examId)?.status;
  }
  statusSeverity(s?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | 'warning' | 'info' | undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return undefined;
  }

  // ——— Helpers UI ———
  get disableAllEdits(): boolean {
    const s = this.order?.state;
    return s === 'ENTREGADA' || s === 'ANULADA';
  }
}
