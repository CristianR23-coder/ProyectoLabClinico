import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

export interface NewSamplePayload {
  ordenId: string;
  tipo: string;
  codigoBarra?: string | null;
  fechaToma: Date | string;
  estado: SampleStatus;
  observacion?: string | null;
}

@Component({
  selector: 'app-new-sample-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule,
    DatePickerModule, TextareaModule, DividerModule, SelectModule,
  ],
  templateUrl: './create-sample.html',
  styleUrls: ['./create-sample.css'],
})
export class CreateSample implements OnInit {
  @Input() visible = false;                 // al entrar por ruta lo encendemos en ngOnInit
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Si vienes desde /ordenes/:id/muestras/nueva puedes inyectar el ordenId aquí */
  @Input() ordenIdPrefill: string | null = null;

  @Output() create = new EventEmitter<NewSamplePayload>();
  @Output() cancel = new EventEmitter<void>();

  // ✅ Form reactivo (definite assignment)
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

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      ordenId:       ['', Validators.required],
      tipo:          ['Sangre', Validators.required],
      codigoBarra:   [null],
      fechaToma:     [new Date(), Validators.required],
      estado:        ['pendiente' as SampleStatus, Validators.required],
      observacion:   [null],
    });
  }

  ngOnInit(): void {
    // al entrar por /muestras/nueva mostramos el diálogo
    this.visible = true;
    if (this.ordenIdPrefill) {
      this.form.get('ordenId')?.setValue(this.ordenIdPrefill);
    }
  }

  // UX
  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
    this.router.navigate(['/muestras']); // volver a la lista al cerrar
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    const payload: NewSamplePayload = {
      ordenId:     v.ordenId!,
      tipo:        v.tipo!,
      codigoBarra: v.codigoBarra ?? null,
      fechaToma:   v.fechaToma!,
      estado:      v.estado!,
      observacion: v.observacion ?? null,
    };

    this.create.emit(payload);
    this.visible = false;
    this.visibleChange.emit(false);
    this.router.navigate(['/muestras']);
  }
}

/* Tipos del formulario */
type SampleForm = {
  ordenId: FormControl<string>;
  tipo: FormControl<string>;
  codigoBarra: FormControl<string | null>;
  fechaToma: FormControl<Date>;
  estado: FormControl<SampleStatus>;
  observacion: FormControl<string | null>;
};
