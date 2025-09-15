// src/app/parameters/create-parameter/create-parameter.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// 👇 ajusta las rutas según tu árbol real
import { ParameterService } from '../../../services/parameter-service';
import { ParameterI, TypeValue } from '../../../models/parameter-model';

import { ExamsService } from '../../../services/exam-service';
import { ExamI } from '../../../models/exam-model';

@Component({
  selector: 'app-create-parameter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './create-parameter.html'
})
export class CreateParameter {
  @Input() examenId?: number;               // ← si viene del padre (ver examen), estará definido
  @Output() created = new EventEmitter<ParameterI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private paramsSvc = inject(ParameterService);
  private examsSvc = inject(ExamsService);

  exams$ = this.examsSvc.exams$;            // para el selector, en modo global

  form = this.fb.group({
    // 👇 solo requerido en modo global (cuando no llega @Input examenId)
    examenId: this.fb.control<number | null>(null),
    code: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
    name: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(150)] }),
    unit: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
    typeValue: this.fb.control<TypeValue>('NUMERICO', { nonNullable: true }),
    decimals: this.fb.control<number | null>(2),
    refMin: this.fb.control<number | null>(null),
    refMax: this.fb.control<number | null>(null),
    visualOrder: this.fb.control<number | null>(1),
  });

  save(): void {
    // si no llegó por @Input, debe venir en el form
    const v = this.form.getRawValue();
    const targetExamId = this.examenId ?? v.examenId ?? undefined;

    if (!targetExamId) {
      this.form.controls.examenId.addValidators(Validators.required);
      this.form.controls.examenId.updateValueAndValidity();
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const type = v.typeValue!;
    const payload: Omit<ParameterI, 'id' | 'examenId'> = {
      code: v.code ? v.code.trim().toUpperCase() : null,
      name: (v.name ?? '').trim(),
      unit: v.unit ? v.unit.trim() : null,
      typeValue: type,
      decimals: type === 'NUMERICO' ? (v.decimals ?? 2) : null,
      refMin: type === 'NUMERICO' ? (v.refMin ?? null) : null,
      refMax: type === 'NUMERICO' ? (v.refMax ?? null) : null,
      visualOrder: v.visualOrder ?? 1,
    };

    this.paramsSvc.add(targetExamId, payload).subscribe(p => this.created.emit(p));
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
