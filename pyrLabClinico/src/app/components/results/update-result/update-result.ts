// update-result.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

type ParamTipo = 'num' | 'texto' | 'bool';

export interface ResultItem {
  id: string;
  ordenExamenId: string;
  parametroId: string;
  tipo: ParamTipo;
  valorNum?: number | null;
  valorTexto?: string | null;
  valorBool?: boolean | null;
  unidad?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  observacion?: string | null;
  validado?: boolean;
}

@Component({
  selector: 'app-edit-result-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    DialogModule, ButtonModule, InputTextModule, InputNumberModule,
    TextareaModule, DividerModule, SelectModule
  ],
  templateUrl: './update-result.html',
})
export class UpdateResult implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Bundle (mismo ordenExamenId) — estático por defecto */
  @Input() items: ResultItem[] = [
    { id:'r1', ordenExamenId:'OE-001', parametroId:'GLU',  tipo:'num',   valorNum:95, unidad:'mg/dL', refMin:70, refMax:100, validado:true },
    { id:'r2', ordenExamenId:'OE-001', parametroId:'OBS',  tipo:'texto', valorTexto:'Ayunas', validado:true },
  ];

  @Output() update = new EventEmitter<ResultItem[]>();
  @Output() cancel = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<string>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      items: this.fb.array<FormGroup<RowForm>>([]),
    });
  }

  get rows(): FormArray<FormGroup<RowForm>> {
    return this.form.get('items') as any;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) this.rebuild(this.items);
    if (!this.visible && (this.items?.length ?? 0) > 0) {
      this.visible = true;
      this.visibleChange.emit(true);
    }
  }

  private rebuild(items: ResultItem[]) {
    this.rows.clear();
    (items || []).forEach(r => {
      this.rows.push(this.fb.group<RowForm>({
        id:            new FormControl<string>(r.id ?? '', { nonNullable: true }),
        ordenExamenId: new FormControl<string>(r.ordenExamenId ?? '', { nonNullable: true }),
        parametroId:   new FormControl<string>(r.parametroId ?? '', { nonNullable: true }),
        tipo:          new FormControl<ParamTipo>(r.tipo ?? 'num', { nonNullable: true }),

        valorNum:      new FormControl<number | null>(r.valorNum ?? null),
        valorTexto:    new FormControl<string | null>(r.valorTexto ?? null),
        valorBool:     new FormControl<boolean | null>(r.valorBool ?? null),
        unidad:        new FormControl<string | null>(r.unidad ?? null),
        refMin:        new FormControl<number | null>(r.refMin ?? null),
        refMax:        new FormControl<number | null>(r.refMax ?? null),
        observacion:   new FormControl<string | null>(r.observacion ?? null),

        validado:      new FormControl<boolean>(!!r.validado, { nonNullable: true }),
      }));
    });
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  submit() {
    const out: ResultItem[] = this.rows.controls.map(g => {
      const v = g.getRawValue();
      return {
        id: v.id,
        ordenExamenId: v.ordenExamenId,
        parametroId: v.parametroId,
        tipo: v.tipo,
        valorNum:   v.tipo === 'num'   ? (v.valorNum ?? null)   : null,
        valorTexto: v.tipo === 'texto' ? (v.valorTexto ?? null) : null,
        valorBool:  v.tipo === 'bool'  ? (v.valorBool ?? null)  : null,
        unidad: v.unidad ?? null,
        refMin: v.refMin ?? null,
        refMax: v.refMax ?? null,
        observacion: v.observacion ?? null,
        validado: v.validado,
      } as ResultItem;
    });

    this.update.emit(out);
    this.onHide();
  }

  onRemove(i: number) {
    const id = this.rows.at(i).get('id')?.value as string;
    if (id) this.removeRow.emit(id);
    this.rows.removeAt(i);
  }
}

/** Typed forms */
type RowForm = {
  id: FormControl<string>;
  ordenExamenId: FormControl<string>;
  parametroId: FormControl<string>;
  tipo: FormControl<ParamTipo>;

  valorNum: FormControl<number | null>;
  valorTexto: FormControl<string | null>;
  valorBool: FormControl<boolean | null>;
  unidad: FormControl<string | null>;
  refMin: FormControl<number | null>;
  refMax: FormControl<number | null>;
  observacion: FormControl<string | null>;

  validado: FormControl<boolean>;
};
