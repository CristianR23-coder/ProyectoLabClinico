// create-order.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

export interface NewOrderPayload {
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
  total: number;
  pruebas: number;
}

@Component({
  selector: 'app-new-order-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule,
    DatePickerModule, AutoCompleteModule, TextareaModule, DividerModule,
    SelectModule,
  ],
  templateUrl: './create-order.html',
  styleUrls: ['./create-order.css'],
})
export class CreateOrder implements OnInit {
  @Input() visible = false;                 // al entrar por ruta lo encendemos en ngOnInit
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() examCatalog: Exam[] = [];
  @Input() currencyCode = 'COP';

  @Output() create = new EventEmitter<NewOrderPayload>();
  @Output() cancel = new EventEmitter<void>();

  // ✅ usar definite assignment para cumplir strictPropertyInitialization
  form!: FormGroup;

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

  filteredExams: Exam[] = [];

  // ✅ UN SOLO constructor
  constructor(private fb: FormBuilder, private router: Router) {
    // inicializamos el form aquí
    this.form = this.fb.group({
      pacienteId: ['', Validators.required],
      medicoId: ['', Validators.required],
      aseguradoraId: [null],
      fechaCreacion: [new Date(), Validators.required],
      estado: ['pendiente' as OrderStatus, Validators.required],
      observaciones: [''],

      muestras: this.fb.array<FormGroup<MuestraForm>>([]),
      examenes: this.fb.array<FormGroup<OrdenExamenForm>>([]),
    });

    this.addMuestra();
    this.addExamen();
  }

  ngOnInit(): void {
    // al entrar por /ordenes/nueva mostramos el diálogo
    this.visible = true;
  }

  // getters
  get muestras(): FormArray<FormGroup<MuestraForm>> { return this.form.get('muestras') as any; }
  get examenes(): FormArray<FormGroup<OrdenExamenForm>> { return this.form.get('examenes') as any; }
  get total(): number { return this.examenes.controls.reduce((a, g) => a + Number(g.get('precio')?.value ?? 0), 0); }
  get totalPruebas(): number { return this.examenes.length; }

  // muestras
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

  // examenes
  addExamen() {
    const g = this.fb.group<OrdenExamenForm>({
      examenId: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      examNombre: new FormControl<string>('', { nonNullable: true }),
      precio: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
      panelId: new FormControl<string | null>(null),
      examCtrl: new FormControl<Exam | null>(null), // solo UI
    });
    this.examenes.push(g);
  }
  removeExamen(i: number) { if (this.examenes.length > 1) this.examenes.removeAt(i); }

  // autocomplete
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

  // UX
  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.router.navigate(['/ordenes']); // volver a la lista al cerrar
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    const payload: NewOrderPayload = {
      numero: this.generateNumero(),
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

    this.create.emit(payload);
    this.visible = false;
    this.visibleChange.emit(false);
    this.router.navigate(['/ordenes']);
  }

  private generateNumero(): string {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
    const rand = Math.floor(Math.random()*1000).toString().padStart(3,'0');
    return `ORD-${stamp}-${rand}`;
  }
}

/* Tipos del formulario */
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
