import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { ExamsService } from '../../../services/exam-service';
import { ExamI, SpecimenType } from '../../../models/exam-model';

@Component({
  selector: 'app-edit-exam',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, InputNumberModule, SelectModule, ButtonModule, DividerModule
  ],
  templateUrl: './update-exam.html'
})
export class UpdateExam implements OnInit {
  // Si lo usas en diálogo, pásale el id
  @Input() examId?: number;

  // Eventos para el padre (p. ej., cerrar diálogo)
  @Output() saved = new EventEmitter<ExamI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private examsSvc = inject(ExamsService);

  exam?: ExamI;
  loading = true;

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

  ngOnInit(): void {
    // Si no vino por @Input, lo tomamos de la ruta
    if (this.examId == null) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.examId = idParam ? Number(idParam) : undefined;
    }
    if (!this.examId || Number.isNaN(this.examId)) {
      this.loading = false;
      return;
    }

    this.examsSvc.getById(this.examId).subscribe(ex => {
      this.exam = ex;
      this.loading = false;
      if (ex) this.patchForm(ex);
    });
  }

  private patchForm(ex: ExamI): void {
    this.form.reset({
      code: ex.code ?? '',
      name: ex.name ?? '',
      method: ex.method ?? null,
      specimenType: ex.specimenType ?? undefined,
      processingTimeMin: ex.processingTimeMin ?? null,
      priceBase: ex.priceBase ?? 0,
      status: ex.status
    });
  }

  save(): void {
    if (!this.exam?.id) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    const patch: Partial<ExamI> = {
      code: (v.code ?? '').trim().toUpperCase(),
      name: (v.name ?? '').trim(),
      method: (v.method ?? undefined)?.trim() || undefined,
      specimenType: v.specimenType ?? undefined,
      processingTimeMin: v.processingTimeMin ?? null,
      priceBase: v.priceBase ?? 0,
      status: v.status
    };

    this.examsSvc.update(this.exam.id, patch).subscribe(updated => {
      if (updated) {
        this.saved.emit(updated);
      }
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
