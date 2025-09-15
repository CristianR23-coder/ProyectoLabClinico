import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { DoctorsService } from '../../../services/doctor-service';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-create-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './create-doctor.html'
})
export class CreateDoctor {
  private fb = inject(FormBuilder);
  private svc = inject(DoctorsService);

  @Output() created = new EventEmitter<DoctorI>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.group({
    name: this.fb.control<string>('', { validators: [Validators.required] }),
    docNumber: this.fb.control<string>('', { validators: [Validators.required] }),
    docType: this.fb.control<string>('CC'),
    specialty: this.fb.control<string>(''),
    medicalLicense: this.fb.control<string>(''),
    phone: this.fb.control<string>(''),
    email: this.fb.control<string>(''),
    status: this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true })
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.add(this.form.getRawValue() as Omit<DoctorI,'id'>).subscribe(d => this.created.emit(d));
  }
  cancel(): void { this.cancelled.emit(); }
}
