import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { PatientsService } from '../../../services/patient-service';
import { InsurancesService } from '../../../services/insurance-service'; // tu servicio de aseguradoras
import { PatientI } from '../../../models/patient-model';
import { InsuranceI } from '../../../models/insurance-model';

@Component({
  selector: 'app-create-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './create-patient.html'
})
export class CreatePatient implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PatientsService);
  private insSvc = inject(InsurancesService);

  @Output() created = new EventEmitter<PatientI>();
  @Output() cancelled = new EventEmitter<void>();

  insurances: InsuranceI[] = [];

  form = this.fb.group({
    firstName: this.fb.control<string>('', { validators: [Validators.required] }),
    lastName:  this.fb.control<string>('', { validators: [Validators.required] }),
    docType:   this.fb.control<string>('CC'),
    docNumber: this.fb.control<string>('', { validators: [Validators.required] }),
    email:     this.fb.control<string>(''),
    phone:     this.fb.control<string>(''),
    insuranceId: this.fb.control<number | null>(null),
    status: this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true })
  });

  ngOnInit(): void {
    this.insSvc.list({ status: 'ACTIVE' }).subscribe(list => this.insurances = list);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const insurance = v.insuranceId ? this.insurances.find(i => i.id === v.insuranceId) : undefined;

    const payload: Omit<PatientI, 'id'> = {
      firstName: v.firstName!, lastName: v.lastName!,
      docType: v.docType || 'CC', docNumber: v.docNumber!,
      email: v.email || undefined, phone: v.phone || undefined,
      status: v.status!, insurance
    };

    this.svc.add(payload).subscribe(p => this.created.emit(p));
  }

  cancel(): void { this.cancelled.emit(); }
}
