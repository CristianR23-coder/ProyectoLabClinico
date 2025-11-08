import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { OrdersService } from '../../../services/order-service';
import { OrderI, OrderState } from '../../../models/order-model';
import { PatientI } from '../../../models/patient-model';
import { DoctorI } from '../../../models/doctor-model';
import { InsuranceI } from '../../../models/insurance-model';
import { PatientsService } from '../../../services/patient-service';
import { DoctorsService } from '../../../services/doctor-service';
import { InsurancesService } from '../../../services/insurance-service';

// ⬇️ Usa la ruta real de tu ExamsService (según mostraste antes es /exams/service)
import { ExamsService } from '../../../services/exam-service';
import { ExamI } from '../../../models/exam-model';
import { OrderItemI } from '../../../models/order-item-model';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, DatePickerModule, SelectModule, TextareaModule,
    ButtonModule, DividerModule, TableModule, TagModule
  ],
  templateUrl: './create-order.html'
})
export class CreateOrder implements OnInit {
  private fb = inject(FormBuilder);
  private ordersSvc = inject(OrdersService);
  private examsSvc = inject(ExamsService);
  private patientsSvc = inject(PatientsService);
  private doctorsSvc = inject(DoctorsService);
  private insSvc = inject(InsurancesService);

  @Output() created = new EventEmitter<OrderI>();
  @Output() cancelled = new EventEmitter<void>();

  patients: PatientI[] = [];
  doctors: DoctorI[] = [];
  insurances: InsuranceI[] = [];

  // Exámenes disponibles (cargamos solo activos)
  exams: ExamI[] = [];

  priorityOptions = [
    { label: 'Rutina', value: 'RUTINA' as const },
    { label: 'Urgente', value: 'URGENTE' as const }
  ];

  readonly fixedState: OrderState = 'CREADA';

  // Form principal (cabecera)
  form = this.fb.group({
    patientId:  this.fb.control<number | null>(null, { validators: [Validators.required] }),
    doctorId:   this.fb.control<number | null>(null),
    insuranceId:this.fb.control<number | null>(null),

    priority:   this.fb.control<'RUTINA' | 'URGENTE'>('RUTINA', { nonNullable: true }),
    orderDate:  this.fb.control<Date | null>(new Date(), { validators: [Validators.required] }),
    observations: this.fb.control<string>(''),

    netTotal:   this.fb.control<number>({ value: 0, disabled: true }, { nonNullable: true })
  });

  // Form mini para agregar un examen
  itemForm = this.fb.group({
    examId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
    price:  this.fb.control<number | null>(null) // opcional; si es null, usa priceBase
  });

  // Ítems seleccionados para la nueva orden (aún sin ID de orden)
  items: OrderItemI[] = [];

  ngOnInit(): void {
    this.examsSvc.list({ status: 'ACTIVE' }).subscribe(list => this.exams = list);
    this.patientsSvc.list({ status: 'ACTIVE' }).subscribe(list => this.patients = list);
    this.doctorsSvc.list({ status: 'ACTIVE' }).subscribe(list => this.doctors = list);
    this.insSvc.list({ status: 'ACTIVE' }).subscribe(list => this.insurances = list);
  }

  // Helpers
  fullName(p?: PatientI): string {
    return p ? `${p.lastName}, ${p.firstName}` : '';
  }

  // Mostrar el ESTADO del EXAMEN en la tabla (ACTIVE/INACTIVE)
  examStatus(it: OrderItemI): 'ACTIVE' | 'INACTIVE' | undefined {
    return this.exams.find(e => e.id === it.examId)?.status;
  }
  examStatusSeverity(s?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | 'info' | undefined {
    if (!s) return undefined;
    return s === 'ACTIVE' ? 'success' : 'danger';
  }

  // --- Exámenes (agregar / quitar / totalizar) ---
  addExam(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const { examId, price } = this.itemForm.getRawValue();
    const exam = this.exams.find(e => e.id === examId!);
    if (!exam) return;

    // evita duplicados por examId
    if (this.items.some(it => it.examId === exam.id)) {
      alert('Ese examen ya está agregado a la orden.');
      return;
    }

    const item: OrderItemI = {
      id: undefined,
      orderId: -1, // placeholder
      examId: exam.id!,
      code: exam.code,
      name: exam.name,
      price: price != null ? Number(price) : (exam.priceBase ?? 0),
      state: 'PENDIENTE'
    };
    this.items = [item, ...this.items];
    this.recalcTotal();
    this.itemForm.reset();
  }

  removeItem(it: OrderItemI): void {
    this.items = this.items.filter(x => x !== it);
    this.recalcTotal();
  }

  recalcTotal(): void {
    const total = this.items.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
    this.form.controls.netTotal.setValue(total, { emitEvent: false });
  }

  // Guardar
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.items.length === 0) {
      alert('Agrega al menos un examen a la orden.');
      return;
    }

    const v = this.form.getRawValue();

    // Resolver objetos (mientras OrdersService espera objetos completos)
    const patient = this.patients.find(p => p.id === v.patientId!)!;
    const doctor  = v.doctorId ? this.doctors.find(d => d.id === v.doctorId) : undefined;
    const insurance = v.insuranceId ? this.insurances.find(i => i.id === v.insuranceId) : undefined;

    const payload: Omit<OrderI, 'id'> = {
      orderDate: (v.orderDate ?? new Date()).toISOString(),
      state: this.fixedState,
      priority: v.priority!,
      observations: v.observations || undefined,
      netTotal: Number(v.netTotal) || 0,  // el servicio igual lo recalcula
      patient,
      doctor,
      insurance,
      status: 'ACTIVE',
      items: this.items
    };

    this.ordersSvc.add(payload).subscribe(newOrder => {
      this.created.emit(newOrder);
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  get canSave(): boolean {
    return this.form.valid && this.items.length > 0;
  }
}
