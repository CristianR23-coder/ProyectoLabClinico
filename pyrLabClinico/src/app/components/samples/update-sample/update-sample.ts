import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

export type SampleStatus = 'pendiente' | 'tomada' | 'rechazada' | 'enviada' | 'archivada';

/** Modelo esperado para editar (ajústalo a tu API si difiere) */
export interface SampleForEdit {
  id: string;
  ordenId: string;                 // FK a la orden
  tipo: string;
  codigoBarra?: string | null;
  fechaToma: Date | string | null;
  estado: SampleStatus;
  observacion?: string | null;
}

export type SampleUpdatePayload = SampleForEdit;

@Component({
  selector: 'app-edit-sample-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule,
    DatePickerModule, TextareaModule, DividerModule, SelectModule,
  ],
  templateUrl: './update-sample.html',
  styleUrls: ['./update-sample.css'],
})
export class UpdateSample implements OnInit, OnChanges {
  /* Visibilidad del diálogo */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /* Datos */
  @Input() sample: SampleForEdit | null = null;

  /* Eventos */
  @Output() update = new EventEmitter<SampleUpdatePayload>();
  @Output() cancel = new EventEmitter<void>();
  @Output() remove = new EventEmitter<string>(); // id de la muestra a eliminar

  // --- Formulario ---
  form!: FormGroup;

  tiposMuestra = [
    { label: 'Sangre', value: 'Sangre' },
    { label: 'Suero',  value: 'Suero'  },
    { label: 'Plasma', value: 'Plasma' },
    { label: 'Orina',  value: 'Orina'  },
    { label: 'Hisopo', value: 'Hisopo' },
    { label: 'Tejido', value: 'Tejido' },
    { label: 'Otro',   value: 'Otro'   },
  ];

  estados: { label: string; value: SampleStatus }[] = [
    { label: 'pendiente', value: 'pendiente' },
    { label: 'tomada',    value: 'tomada'    },
    { label: 'rechazada', value: 'rechazada' },
    { label: 'enviada',   value: 'enviada'   },
    { label: 'archivada', value: 'archivada' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      ordenId:     ['', Validators.required],
      tipo:        ['Sangre', Validators.required],
      codigoBarra: [null],
      fechaToma:   [new Date(), Validators.required],
      estado:      ['pendiente' as SampleStatus, Validators.required],
      observacion: [null],
    });
  }

  ngOnInit(): void {
    if (this.sample) this.loadFromSample(this.sample);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sample'] && this.sample) {
      this.loadFromSample(this.sample);
      if (!this.visible) {
        this.visible = true;
        this.visibleChange.emit(true);
      }
    }
  }

  /* ====== Cargar valores al form ====== */
  private loadFromSample(s: SampleForEdit) {
    this.form.reset({
      ordenId: s.ordenId,
      tipo: s.tipo ?? 'Sangre',
      codigoBarra: s.codigoBarra ?? null,
      fechaToma: s.fechaToma ? new Date(s.fechaToma) : new Date(),
      estado: s.estado,
      observacion: s.observacion ?? null,
    });
  }

  /* ====== UX ====== */
  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  submit() {
    if (!this.sample) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    const payload: SampleUpdatePayload = {
      id: this.sample.id,
      ordenId: v.ordenId!,
      tipo: v.tipo!,
      codigoBarra: v.codigoBarra ?? null,
      fechaToma: v.fechaToma!,
      estado: v.estado!,
      observacion: v.observacion ?? null,
    };

    this.update.emit(payload);
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onRemove() {
    if (this.sample) this.remove.emit(this.sample.id);
  }
}

/* Tipado fuerte opcional del form si lo deseas */
type SampleForm = {
  ordenId: FormControl<string>;
  tipo: FormControl<string>;
  codigoBarra: FormControl<string | null>;
  fechaToma: FormControl<Date>;
  estado: FormControl<SampleStatus>;
  observacion: FormControl<string | null>;
};
