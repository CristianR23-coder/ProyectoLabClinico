import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

import { ResultsService } from '../../../services/result-service';
import { ResultI } from '../../../models/result-model';
import { ParameterService } from '../../../services/parameter-service';
import { ParameterI } from '../../../models/parameter-model';
import { DoctorsService } from '../../../services/doctor-service';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-validated-result',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, TextareaModule, InputNumberModule, DatePickerModule,
    ButtonModule, DividerModule, SelectModule
  ],
  templateUrl: './validated-result.html'
})
export class ValidatedResult implements OnInit {
  @Input({ required: true }) resultId!: number;

  @Output() validated = new EventEmitter<ResultI>();
  @Output() rejected  = new EventEmitter<ResultI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private resultsSvc = inject(ResultsService);
  private paramsSvc  = inject(ParameterService);
  private doctorsSvc = inject(DoctorsService);

  loading = true;
  result?: ResultI;
  param?: ParameterI;
  doctors: DoctorI[] = [];

  // Campos de solo visualización (deshabilitados) + el único campo editable: validatedForId
  form = this.fb.group({
    numValue:   this.fb.control<number | null>({ value: null, disabled: true }),
    textValue:  this.fb.control<string | null>({ value: null, disabled: true }),
    dateResult: this.fb.control<Date | null>({ value: null, disabled: true }),
    units:      this.fb.control<string | null>({ value: null, disabled: true }),
    method:     this.fb.control<string | null>({ value: null, disabled: true }),
    outRange:   this.fb.control<boolean | null>({ value: null, disabled: true }),
    comment:    this.fb.control<string | null>({ value: null, disabled: true }),

    // 👇 ÚNICO campo editable para selección del médico
    validatedForId: this.fb.control<number | null>(null, { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    // Cargar médicos
    this.doctorsSvc.list().subscribe(ds => this.doctors = ds || []);

    // Cargar resultado
    this.resultsSvc.getById(this.resultId).subscribe(r => {
      this.result = r ?? undefined;
      if (!r) { this.loading = false; return; }

      this.paramsSvc.getById(r.parameterId).subscribe(p => this.param = p ?? undefined);

      this.form.patchValue({
        numValue:   r.numValue ?? null,
        textValue:  r.textValue ?? null,
        dateResult: r.dateResult ? new Date(r.dateResult) : null,
        units:      r.units ?? null,
        method:     r.method ?? null,
        outRange:   r.outRange ?? null,
        comment:    r.comment ?? null,
        validatedForId: r.validatedForId ?? null
      });

      this.loading = false;
    });
  }

  private withDoctorPatch(base: Partial<ResultI>): Partial<ResultI> {
    const id = this.form.controls.validatedForId.value ?? null;
    const doc = this.doctors.find(d => d.id === id);
    return {
      ...base,
      validatedForId: id,
      validatedFor: doc?.name ?? null,
      dateResult: new Date().toISOString(), // actualiza timestamp de la acción
    };
  }

  onCancel(): void { this.cancelled.emit(); }

  onValidate(): void {
    if (!this.result?.id) return;
    if (this.form.controls.validatedForId.invalid) {
      this.form.controls.validatedForId.markAsTouched();
      return;
    }
    const patch = this.withDoctorPatch({ resultState: 'VALIDADO' as const });
    this.resultsSvc.update(this.result.id, patch).subscribe(updated => {
      if (updated) this.validated.emit(updated);
    });
  }

  onReject(): void {
    if (!this.result?.id) return;
    if (this.form.controls.validatedForId.invalid) {
      this.form.controls.validatedForId.markAsTouched();
      return;
    }
    const patch = this.withDoctorPatch({ resultState: 'RECHAZADO' as const });
    this.resultsSvc.update(this.result.id, patch).subscribe(updated => {
      if (updated) this.rejected.emit(updated);
    });
  }
}
