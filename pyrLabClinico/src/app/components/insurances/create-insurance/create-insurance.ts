import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InsurancesService } from '../../../services/insurance-service';
import { InsuranceI } from '../../../models/insurance-model';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-create-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, DividerModule, SelectModule],
  templateUrl: './create-insurance.html'
})
export class CreateInsurance {
  private fb = inject(FormBuilder);
  private insSvc = inject(InsurancesService);

  @Output() created = new EventEmitter<InsuranceI>();
  @Output() cancelled = new EventEmitter<void>();

  form = this.fb.group({
    name:    this.fb.control('', { validators: [Validators.required] }),
    nit:     this.fb.control<string | null>(null),
    email:   this.fb.control<string | null>(null),
    phone:   this.fb.control<string | null>(null),
    address: this.fb.control<string | null>(null), // ← NUEVO control
    status:  this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true }),
  });

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const payload: Omit<InsuranceI, 'id'> = {
      name: v.name!,
      nit: v.nit || undefined,
      email: v.email || undefined,
      phone: v.phone || undefined,
      address: v.address || undefined, // ← incluir en payload
      status: v.status!,
    };
    this.insSvc.add(payload).subscribe(newItem => this.created.emit(newItem));
  }

  cancel(): void { this.cancelled.emit(); }
}
