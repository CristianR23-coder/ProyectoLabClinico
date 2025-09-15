import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { DoctorsService } from '../../../services/doctor-service';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-update-doctor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './update-doctor.html'
})
export class UpdateDoctor implements OnInit {
  @Input() doctorId?: number;
  @Output() saved = new EventEmitter<DoctorI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private svc = inject(DoctorsService);

  loading = true;
  doctor?: DoctorI;

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

  ngOnInit(): void {
    if (!this.doctorId) { this.loading = false; return; }
    this.svc.getById(this.doctorId).subscribe(d => {
      this.doctor = d;
      if (d) this.form.reset({
        name: d.name, docNumber: d.docNumber, docType: d.docType || 'CC',
        specialty: d.specialty || '', medicalLicense: d.medicalLicense || '',
        phone: d.phone || '', email: d.email || '', status: d.status
      });
      this.loading = false;
    });
  }

  save(): void {
    if (!this.doctor?.id) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.svc.update(this.doctor.id, this.form.getRawValue() as Partial<DoctorI>)
      .subscribe(u => { if (u) this.saved.emit(u); });
  }
  cancel(): void { this.cancelled.emit(); }
}
