import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { ResultsService } from '../../../services/result-service';
import { ResultI, ResultState } from '../../../models/result-model';
import { ParameterService } from '../../../services/parameter-service';
import { ParameterI } from '../../../models/parameter-model';
import { DoctorsService } from '../../../services/doctor-service';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-update-result',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, TextareaModule, InputNumberModule, DatePickerModule, SelectModule, ButtonModule, DividerModule
  ],
  templateUrl: './update-result.html'
})
export class UpdateResult implements OnInit {
  @Input({ required: true }) resultId!: number;

  @Output() saved = new EventEmitter<ResultI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private resultsSvc = inject(ResultsService);
  private paramsSvc = inject(ParameterService);
  private doctorsSvc = inject(DoctorsService);

  result?: ResultI;
  param?: ParameterI;
  doctors: DoctorI[] = [];
  loading = true;

  stateOptions: ResultState[] = ['PENDIENTE', 'VALIDADO', 'RECHAZADO'];

  form = this.fb.group({
    numValue: this.fb.control<number | null>(null),
    textValue: this.fb.control<string | null>(null),
    dateResult: this.fb.control<Date | null>(null),
    resultState: this.fb.control<ResultState>('PENDIENTE', { nonNullable: true }),
    validatedForId: this.fb.control<number | null>(null),
    comment: this.fb.control<string | null>(null)
  });

  ngOnInit(): void {
    this.doctorsSvc.list().subscribe(ds => (this.doctors = ds));

    this.resultsSvc.getById(this.resultId).subscribe(r => {
      this.result = r ?? undefined;
      if (!r) { this.loading = false; return; }

      this.paramsSvc.getById(r.parameterId).subscribe(p => this.param = p ?? undefined);

      this.form.reset({
        numValue: r.numValue ?? null,
        textValue: r.textValue ?? null,
        dateResult: r.dateResult ? new Date(r.dateResult) : new Date(),
        resultState: r.resultState,
        validatedForId: r.validatedForId ?? null,
        comment: r.comment ?? null
      });

      // validadores dinámicos
      if (this.param?.typeValue === 'NUMERICO') this.form.controls.numValue.addValidators([Validators.required]);
      else this.form.controls.textValue.addValidators([Validators.required, Validators.maxLength(200)]);

      this.loading = false;
    });
  }

  private computeFueraRango(valor?: number | null): boolean | null {
    if (this.param?.typeValue !== 'NUMERICO') return null;
    if (valor == null) return null;
    const min = this.param.refMin ?? null;
    const max = this.param.refMax ?? null;
    if (min == null && max == null) return null;
    if (min != null && valor < min) return true;
    if (max != null && valor > max) return true;
    return false;
  }

  save(): void {
    if (!this.result?.id) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const doc = this.doctors.find(d => d.id === (v.validatedForId ?? undefined));

    const patch: Partial<ResultI> = {
      numValue: this.param?.typeValue === 'NUMERICO' ? (v.numValue ?? null) : null,
      textValue: this.param?.typeValue === 'NUMERICO' ? null : (v.textValue ?? null),
      dateResult: v.dateResult ? v.dateResult.toISOString() : undefined,
      resultState: v.resultState,
      validatedForId: v.validatedForId ?? null,
      validatedFor: doc?.name ?? null,
      comment: v.comment ?? null,
      outRange: this.computeFueraRango(v.numValue ?? null)
    };

    this.resultsSvc.update(this.result.id, patch).subscribe(updated => {
      if (updated) this.saved.emit(updated);
    });
  }

  cancel(): void { this.cancelled.emit(); }
}
