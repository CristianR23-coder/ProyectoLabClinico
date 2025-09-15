import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { ExamsService } from '../../../services/exam-service';
import { ExamI, SpecimenType } from '../../../models/exam-model';

@Component({
  selector: 'app-create-exam',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, DividerModule
  ],
  templateUrl: './create-exam.html'
})
export class CreateExam implements OnInit {
  private fb = inject(FormBuilder);
  private examsSvc = inject(ExamsService);

  @Output() created = new EventEmitter<ExamI>();
  @Output() cancelled = new EventEmitter<void>();

  statusOptions = [
    { label: 'Activo', value: 'ACTIVE' as const },
    { label: 'Inactivo', value: 'INACTIVE' as const }
  ];

  specimenOptions: { label: string; value: SpecimenType }[] = [
    { label: 'Sangre', value: 'SANGRE' },
    { label: 'Suero', value: 'SUERO' },
    { label: 'Plasma', value: 'PLASMA' },
    { label: 'Orina', value: 'ORINA' },
    { label: 'Saliva', value: 'SALIVA' },
    { label: 'Heces', value: 'HECES' },
    { label: 'Tejido', value: 'TEJIDO' },
    { label: 'Otra', value: 'OTRA' }
  ];

  form = this.fb.group({
    code: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(30)] }),
    name: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(150)] }),
    method: this.fb.control<string | null>(null, { validators: [Validators.maxLength(120)] }),
    specimenType: this.fb.control<SpecimenType | undefined>(undefined),
    processingTimeMin: this.fb.control<number | null>(null, { validators: [Validators.min(0)] }),
    priceBase: this.fb.control<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    status: this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true })
  });

  ngOnInit(): void {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    // Normaliza valores de texto
    const code = (v.code ?? '').trim().toUpperCase();
    const name = (v.name ?? '').trim();
    const method = (v.method ?? undefined)?.trim() || undefined;

    const payload: Omit<ExamI, 'id'> = {
      code,
      name,
      method,
      specimenType: v.specimenType ?? undefined,
      processingTimeMin: v.processingTimeMin ?? null,
      priceBase: v.priceBase ?? 0,
      status: v.status
    };

    this.examsSvc.add(payload).subscribe(newExam => {
      this.created.emit(newExam);
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
