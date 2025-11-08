import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { PatientsService } from '../../../services/patient-service';
import { InsurancesService } from '../../../services/insurance-service';
import { PatientI } from '../../../models/patient-model';
import { InsuranceI } from '../../../models/insurance-model';

@Component({
  selector: 'app-update-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './update-patient.html'
})
export class UpdatePatient implements OnInit {
  @Input() patientId?: number;
  @Output() saved = new EventEmitter<PatientI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private svc = inject(PatientsService);
  private insSvc = inject(InsurancesService);

  loading = true;
  item?: PatientI;
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
    this.insSvc.list().subscribe(list => this.insurances = list);
    if (!this.patientId) { this.loading = false; return; }

    this.svc.getById(this.patientId).subscribe(p => {
      this.item = p;
      if (p) {
        this.form.reset({
          firstName: p.firstName, lastName: p.lastName,
          docType: p.docType || 'CC', docNumber: p.docNumber,
          email: p.email || '', phone: p.phone || '',
          insuranceId: p.insurance?.id ?? null,
          status: p.status
        });
      }
      this.loading = false;
    });
  }

  save(): void {
    if (!this.item?.id) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const insuranceId = this.form.controls.insuranceId.value;
    if (insuranceId && !this.insurances.some(i => i.id === insuranceId)) {
      alert('La aseguradora seleccionada ya no está disponible. Selecciona otra e inténtalo de nuevo.');
      return;
    }

    const v = this.form.getRawValue();
    const insurance = v.insuranceId ? this.insurances.find(i => i.id === v.insuranceId) : undefined;

    const patch: Partial<PatientI> = {
      firstName: v.firstName!, lastName: v.lastName!,
      docType: v.docType || 'CC', docNumber: v.docNumber!,
      email: v.email || undefined, phone: v.phone || undefined,
      status: v.status!, insurance
    };

    this.svc.update(this.item.id!, patch).subscribe(u => { if (u) this.saved.emit(u); });
  }

  cancel(): void { this.cancelled.emit(); }
}
