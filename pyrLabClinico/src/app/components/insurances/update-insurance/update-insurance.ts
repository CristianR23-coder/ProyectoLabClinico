import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { InsurancesService } from '../../../services/insurance-service';
import { InsuranceI } from '../../../models/insurance-model';

@Component({
  selector: 'app-update-insurance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, DividerModule, SelectModule],
  templateUrl: './update-insurance.html'
})
export class UpdateInsurance implements OnInit {
  @Input() insuranceId?: number;
  @Output() saved = new EventEmitter<InsuranceI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private insSvc = inject(InsurancesService);

  item?: InsuranceI;
  loading = true;
  saving = false;

  form = this.fb.group({
    name:    this.fb.control('', { validators: [Validators.required] }),
    nit:     this.fb.control<string | null>(null),
    email:   this.fb.control<string | null>(null),
    phone:   this.fb.control<string | null>(null),
    address: this.fb.control<string | null>(null), // ← NUEVO
    status:  this.fb.control<'ACTIVE' | 'INACTIVE'>('ACTIVE', { nonNullable: true }),
  });

  ngOnInit(): void {
    if (!this.insuranceId) { this.loading = false; return; }
    this.insSvc.getById(this.insuranceId).subscribe(it => {
      this.item = it;
      if (it) this.patchForm(it);
      this.loading = false;
    });
  }

  private patchForm(i: InsuranceI) {
    this.form.reset({
      name: i.name ?? '',
      nit: i.nit ?? null,
      email: i.email ?? null,
      phone: i.phone ?? null,
      address: i.address ?? null, // ← cargar al form
      status: i.status ?? 'ACTIVE',
    });
  }

  save(): void {
    if (!this.item?.id) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const patch: Partial<InsuranceI> = {
      name: v.name!,
      nit: v.nit || undefined,
      email: v.email || undefined,
      phone: v.phone || undefined,
      address: v.address || undefined, // ← incluir en el patch
      status: v.status!,
    };

    this.saving = true;
    this.insSvc.update(this.item.id, patch).subscribe(updated => {
      this.saving = false;
      if (updated) this.saved.emit(updated);
    });
  }

  cancel(): void { this.cancelled.emit(); }
}
