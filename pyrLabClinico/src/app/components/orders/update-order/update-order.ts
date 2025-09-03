import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

export type OrderStatus =
  'pendiente' | 'en-proceso' | 'completada' | 'reportada' | 'cancelada';

export interface Exam {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  panelId?: string | null;
}

/** Modelo esperado para editar (ajústalo a tu API si difiere) */
export interface OrderForEdit {
  id: string;
  numero: string;
  pacienteId: string;
  medicoId: string;
  aseguradoraId?: string | null;
  fechaCreacion: Date | string;
  estado: OrderStatus;
  observaciones?: string;
  muestras: {
    tipo: string;
    codigoBarra?: string | null;
    fechaToma: Date | string;
    observacion?: string | null;
  }[];
  examenes: {
    examenId: string;
    examNombre: string;
    precio: number;
    panelId?: string | null;
  }[];
}

export interface OrderUpdatePayload extends OrderForEdit {
  total: number;
  pruebas: number;
}

@Component({
  selector: 'app-edit-order-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule,
    DatePickerModule, AutoCompleteModule, TextareaModule, DividerModule,
    SelectModule,
  ],
  templateUrl: './update-order.html',
  styleUrls: ['./update-order.css'],
})
export class UpdateOrder implements OnInit, OnChanges {
  /* Visibilidad del diálogo */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /* Datos de apoyo */
  @Input() order: OrderForEdit | null = null;
  @Input() examCatalog: Exam[] = [];
  @Input() currencyCode = 'COP';

  /* Eventos */
  @Output() update = new EventEmitter<OrderUpdatePayload>();
  @Output() cancel = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>(); // id de la orden a eliminar (opcional)

  // --- Formulario ---
  form!: FormGroup;
  filteredExams: Exam[] = [];

  // Selects
  tiposMuestra = [
    { label: 'Sangre', value: 'Sangre' },
    { label: 'Suero', value: 'Suero' },
    { label: 'Plasma', value: 'Plasma' },
    { label: 'Orina', value: 'Orina' },
    { label: 'Hisopo', value: 'Hisopo' },
    { label: 'Tejido', value: 'Tejido' },
    { label: 'Otro', value: 'Otro' },
  ];

  estados: { label: string; value: OrderStatus }[] = [
    { label: 'pendiente',  value: 'pendiente' },
    { label: 'en-proceso', value: 'en-proceso' },
    { label: 'completada', value: 'completada' },
    { label: 'reportada',  value: 'reportada' },
    { label: 'cancelada',  value: 'cancelada' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      numero: [{ value: '', disabled: true }],  // normalmente no se edita
      pacienteId: ['', Validators.required],
      medicoId: ['', Validators.required],
      aseguradoraId: [null],
      fechaCreacion: [new Date(), Validators.required],
      estado: ['pendiente' as OrderStatus, Validators.required],
      observaciones: [''],

      muestras: this.fb.array<FormGroup<MuestraForm>>([]),
      examenes: this.fb.array<FormGroup<OrdenExamenForm>>([]),
    });
  }

  ngOnInit(): void {
    // Si entras como ruta/overlay con la orden ya puesta:
    if (this.order) this.loadFromOrder(this.order);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order'] && this.order) {
      this.loadFromOrder(this.order);
      // Mostrar el diálogo si llega una orden y visible no está activado aún
      if (!this.visible) {
        this.visible = true;
        this.visibleChange.emit(true);
      }
    }
  }

  // Getters cómodos
  get muestras(): FormArray<FormGroup<MuestraForm>> { return this.form.get('muestras') as any; }
  get examenes(): FormArray<FormGroup<OrdenExamenForm>> { return this.form.get('examenes') as any; }
  get total(): number { return this.examenes.controls.reduce((a, g) => a + Number(g.get('precio')?.value ?? 0), 0); }
  get totalPruebas(): number { return this.examenes.length; }

  /* ====== Cargar valores al form ====== */
  private loadFromOrder(o: OrderForEdit) {
    // limpiar arrays
    this.muestras.clear();
    this.examenes.clear();

    // set valores base
    this.form.patchValue({
      numero: o.numero ?? '',
      pacienteId: o.pacienteId,
      medicoId: o.medicoId,
      aseguradoraId: o.aseguradoraId ?? null,
      fechaCreacion: o.fechaCreacion ? new Date(o.fechaCreacion) : new Date(),
      estado: o.estado,
      observaciones: o.observaciones ?? '',
    });

    // muestras
    (o.muestras ?? []).forEach(m => {
      this.muestras.push(this.fb.group<MuestraForm>({
        tipo: new FormControl<string>(m.tipo ?? 'Sangre', { nonNullable: true, validators: [Validators.required] }),
        codigoBarra: new FormControl<string | null>(m.codigoBarra ?? null),
        fechaToma: new FormControl<Date>(m.fechaToma ? new Date(m.fechaToma) : new Date(), { nonNullable: true }),
        observacion: new FormControl<string | null>(m.observacion ?? null),
      }));
    });
    if (this.muestras.length === 0) this.addMuestra();

    // examenes
    (o.examenes ?? []).forEach(e => {
      this.examenes.push(this.fb.group<OrdenExamenForm>({
        examenId: new FormControl<string>(e.examenId, { nonNullable: true, validators: [Validators.required] }),
        examNombre: new FormControl<string>(e.examNombre ?? '', { nonNullable: true }),
        precio: new FormControl<number>(e.precio ?? 0, { nonNullable: true, validators: [Validators.min(0)] }),
        panelId: new FormControl<string | null>(e.panelId ?? null),
        examCtrl: new FormControl<Exam | null>(null), // UI
      }));
    });
    if (this.examenes.length === 0) this.addExamen();
  }

  /* ====== Muestras ====== */
  addMuestra() {
    const g = this.fb.group<MuestraForm>({
      tipo: new FormControl<string>('Sangre', { nonNullable: true, validators: [Validators.required] }),
      codigoBarra: new FormControl<string | null>(null),
      fechaToma: new FormControl<Date>(new Date(), { nonNullable: true }),
      observacion: new FormControl<string | null>(null),
    });
    this.muestras.push(g);
  }
  removeMuestra(i: number) { if (this.muestras.length > 1) this.muestras.removeAt(i); }

  /* ====== Exámenes ====== */
  addExamen() {
    const g = this.fb.group<OrdenExamenForm>({
      examenId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      examNombre: new FormControl<string>('', { nonNullable: true }),
      precio: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
      panelId: new FormControl<string | null>(null),
      examCtrl: new FormControl<Exam | null>(null), // UI
    });
    this.examenes.push(g);
  }
  removeExamen(i: number) { if (this.examenes.length > 1) this.examenes.removeAt(i); }

  filterExam(event: any) {
    const q = (event.query ?? '').toLowerCase();
    this.filteredExams = this.examCatalog.filter(e =>
      e.nombre.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q)
    );
  }
  onExamSelect(exam: Exam, idx: number) {
    const g = this.examenes.at(idx);
    g.patchValue({
      examenId: exam.id,
      examNombre: `${exam.codigo} - ${exam.nombre}`,
      precio: exam.precio ?? 0,
      panelId: exam.panelId ?? null,
    });
  }

  /* ====== UX ====== */
  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  submit() {
    if (!this.order) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue(); // incluye 'numero' deshabilitado
    const payload: OrderUpdatePayload = {
      id: this.order.id,
      numero: v.numero ?? this.order.numero,
      pacienteId: v.pacienteId!,
      medicoId: v.medicoId!,
      aseguradoraId: v.aseguradoraId ?? null,
      fechaCreacion: v.fechaCreacion!,
      estado: v.estado!,
      observaciones: v.observaciones ?? '',
      muestras: this.muestras.controls.map(g => ({
        tipo: g.get('tipo')!.value!,
        codigoBarra: g.get('codigoBarra')!.value ?? null,
        fechaToma: g.get('fechaToma')!.value!,
        observacion: g.get('observacion')!.value ?? null,
      })),
      examenes: this.examenes.controls.map(g => ({
        examenId: g.get('examenId')!.value!,
        examNombre: g.get('examNombre')!.value!,
        precio: g.get('precio')!.value ?? 0,
        panelId: g.get('panelId')!.value ?? null,
      })),
      total: this.total,
      pruebas: this.totalPruebas,
    };

    this.update.emit(payload);
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onRemove() {
    if (this.order) this.remove.emit(this.order.id);
  }
}

/* ====== Tipos fuertes para los form groups ====== */
type MuestraForm = {
  tipo: FormControl<string>;
  codigoBarra: FormControl<string | null>;
  fechaToma: FormControl<Date>;
  observacion: FormControl<string | null>;
};
type OrdenExamenForm = {
  examenId: FormControl<string>;
  examNombre: FormControl<string>;
  precio: FormControl<number>;
  panelId: FormControl<string | null>;
  examCtrl: FormControl<Exam | null>;
};
