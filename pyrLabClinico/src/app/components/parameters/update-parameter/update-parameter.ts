// src/app/parameters/update-parameter/update-parameter.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ParameterService } from '../../../services/parameter-service';
import { ParameterI, TypeValue } from '../../../models/parameter-model';

@Component({
  selector: 'app-update-parameter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, DividerModule],
  templateUrl: './update-parameter.html'
})
export class UpdateParameter implements OnInit {
  @Input() parametroId!: number;
  @Output() saved = new EventEmitter<ParameterI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private svc = inject(ParameterService);

  valueTypeOptions: { label: string; value: TypeValue }[] = [
    { label: 'Numérico', value: 'NUMERICO' },
    { label: 'Texto', value: 'TEXTO' },
    { label: 'Cualitativo', value: 'CUALITATIVO' },
    { label: 'Booleano', value: 'BOOLEAN' },
  ];

  form = this.fb.group({
    code: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
    name: this.fb.control<string>('', { validators: [Validators.required, Validators.maxLength(150)] }),
    unit: this.fb.control<string | null>(null, { validators: [Validators.maxLength(30)] }),
    refMin: this.fb.control<number | null>(null),
    refMax: this.fb.control<number | null>(null),
    valueType: this.fb.control<TypeValue>('NUMERICO', { nonNullable: true }),
    decimals: this.fb.control<number | null>(2),
    visualOrder: this.fb.control<number | null>(1),
  });

  row?: ParameterI;

  ngOnInit(): void {
    this.svc.getById(this.parametroId).subscribe(p => {
      this.row = p;
      if (p) this.form.reset({
        code: p.code ?? null,
        name: p.name,
        unit: p.unit ?? null,
        refMin: p.refMin ?? null,
        refMax: p.refMax ?? null,
        valueType: p.typeValue,
        decimals: p.decimals ?? (p.typeValue === 'NUMERICO' ? 2 : null),
        visualOrder: p.visualOrder ?? 1,
      });
    });
  }

  save(): void {
    if (!this.row?.id) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const patch: Partial<ParameterI> = {
      code: (v.code ?? undefined) ? v.code!.trim().toUpperCase() : null,
      name: (v.name ?? '').trim(),
      unit: (v.unit ?? undefined) ? v.unit!.trim() : null,
      refMin: v.refMin ?? null,
      refMax: v.refMax ?? null,
      typeValue: v.valueType!,
      decimals: v.valueType === 'NUMERICO' ? (v.decimals ?? 2) : null,
      visualOrder: v.visualOrder ?? 1,
    };
    this.svc.update(this.row.id, patch).subscribe(updated => { if (updated) this.saved.emit(updated); });
  }

  cancel(): void { this.cancelled.emit(); }
}
