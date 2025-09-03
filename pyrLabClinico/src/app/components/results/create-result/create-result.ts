// create-result.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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

export interface ParamDef {
  parametroId: string;
  nombre: string;
  tipo: ParamTipo;
  unidad?: string | null;
  refMin?: number | null;
  refMax?: number | null;
  posicion?: number | null;
}

export interface ResultItem {
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
}

export interface NewResultPayload {
  ordenExamenId: string;
  resultados: ResultItem[];
}

/* ===== MOCK parámetros por examen ===== */
const MOCK_PARAMS: ParamDef[] = [
  { parametroId:'GLU', nombre:'Glucosa',   tipo:'num',   unidad:'mg/dL', refMin:70,  refMax:100, posicion:1 },
  { parametroId:'OBS', nombre:'Observación',tipo:'texto',unidad:null,    posicion:2 },
];

@Component({
  selector: 'app-new-result-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, TextareaModule, DividerModule, SelectModule],
  templateUrl: './create-result.html',
})
export class CreateResult implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() ordenExamenId = 'OE-001';         // mock de contexto
  @Input() parametros: ParamDef[] = [...MOCK_PARAMS];

  @Output() create = new EventEmitter<NewResultPayload>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({ items: this.fb.array<FormGroup<ResultForm>>([]) });
  }

  ngOnInit(): void {
    this.visible = true;
    this.buildFromParams(this.parametros);
  }

  get items(): FormArray<FormGroup<ResultForm>> { return this.form.get('items') as any; }

  private buildFromParams(defs: ParamDef[]) {
    this.items.clear();
    defs.sort((a,b)=>(a.posicion??0)-(b.posicion??0)).forEach(d => {
      this.items.push(this.fb.group<ResultForm>({
        parametroId: new FormControl(d.parametroId, { nonNullable:true }),
        nombre:      new FormControl(d.nombre,      { nonNullable:true }),
        tipo:        new FormControl(d.tipo,        { nonNullable:true }),
        valorNum:    new FormControl<number | null>(null),
        valorTexto:  new FormControl<string | null>(null),
        valorBool:   new FormControl<boolean | null>(null),
        unidad:      new FormControl<string | null>(d.unidad ?? null),
        refMin:      new FormControl<number | null>(d.refMin ?? null),
        refMax:      new FormControl<number | null>(d.refMax ?? null),
        observacion: new FormControl<string | null>(null),
      }));
    });
  }

  onHide(){ this.visible=false; this.visibleChange.emit(false); this.cancel.emit(); }

  submit(){
    const resultados: ResultItem[] = this.items.controls.map(g=>{
      const v = g.getRawValue();
      return {
        ordenExamenId: this.ordenExamenId,
        parametroId: v.parametroId,
        tipo: v.tipo,
        valorNum:   v.tipo==='num'   ? v.valorNum ?? null   : null,
        valorTexto: v.tipo==='texto' ? v.valorTexto ?? null : null,
        valorBool:  v.tipo==='bool'  ? v.valorBool ?? null  : null,
        unidad: v.unidad ?? null,
        refMin: v.refMin ?? null,
        refMax: v.refMax ?? null,
        observacion: v.observacion ?? null,
      };
    });
    this.create.emit({ ordenExamenId: this.ordenExamenId, resultados });
    this.onHide();
  }
}

type ResultForm = {
  parametroId: FormControl<string>;
  nombre: FormControl<string>;
  tipo: FormControl<ParamTipo>;
  valorNum: FormControl<number | null>;
  valorTexto: FormControl<string | null>;
  valorBool: FormControl<boolean | null>;
  unidad: FormControl<string | null>;
  refMin: FormControl<number | null>;
  refMax: FormControl<number | null>;
  observacion: FormControl<string | null>;
};
