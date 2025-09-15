import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';

import { PanelsService } from '../../../services/panel-service';
import { PanelI, PanelItemI, PanelItemKind, PanelState } from '../../../models/panel-model';
import { ExamsService } from '../../../services/exam-service';     // ajusta si tu ruta difiere
import { ParameterService } from '../../../services/parameter-service';    // ajusta si tu ruta difiere
import { ExamI } from '../../../models/exam-model';
import { ParameterI } from '../../../models/parameter-model';

@Component({
  selector: 'app-create-panel',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    InputTextModule, TextareaModule, ButtonModule, DividerModule,
    SelectModule, CheckboxModule, TableModule
  ],
  templateUrl: './create-panel.html'
})
export class CreatePanel implements OnInit {
  @Output() saved = new EventEmitter<PanelI>();
  @Output() cancelled = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private panelsSvc = inject(PanelsService);
  private examsSvc = inject(ExamsService);
  private paramsSvc = inject(ParameterService);

  exams: ExamI[] = [];
  params: ParameterI[] = [];

  stateOptions: PanelState[] = ['ACTIVO', 'INACTIVO'];
  kindOptions: PanelItemKind[] = ['EXAM', 'PARAM'];

  form = this.fb.group({
    name: this.fb.control<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: this.fb.control<string | null>(null, { validators: [Validators.maxLength(250)] }),
    state: this.fb.control<PanelState>('ACTIVO', { nonNullable: true }),
    items: this.fb.array<FormGroup>([])
  });

  get itemsFA(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.examsSvc.list().subscribe(xs => (this.exams = xs || []));
    this.paramsSvc.list().subscribe(ps => (this.params = ps || []));
    this.addItem(); // al menos una fila
  }

  private newItem(): FormGroup {
    return this.fb.group({
      kind: this.fb.control<PanelItemKind>('EXAM', { nonNullable: true }),
      examId: this.fb.control<number | null>(null),
      parameterId: this.fb.control<number | null>(null),
      required: this.fb.control<boolean>(true, { nonNullable: true }),
      order: this.fb.control<number | null>(null),
      notes: this.fb.control<string | null>(null)
    });
  }

  addItem(): void { this.itemsFA.push(this.newItem()); }
  removeItem(i: number): void { this.itemsFA.removeAt(i); }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const items: PanelItemI[] = (v.items as any[]).map((it, idx) => ({
      kind: it.kind,
      examId: it.kind === 'EXAM' ? (it.examId ?? null) : null,
      parameterId: it.kind === 'PARAM' ? (it.parameterId ?? null) : null,
      required: !!it.required,
      order: it.order ?? idx + 1,
      notes: it.notes ?? null
    }));

    const row: Omit<PanelI, 'id' | 'createdAt' | 'updatedAt'> = {
      name: v.name!,
      description: v.description ?? null,
      state: v.state!,
      items
    };

    this.panelsSvc.add(row).subscribe(created => this.saved.emit(created));
  }

  cancel(): void { this.cancelled.emit(); }
}
