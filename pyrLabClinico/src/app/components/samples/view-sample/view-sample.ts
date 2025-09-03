import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

/* PrimeNG v20 */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

/* 👇 IMPORTA TU DIALOGO DE RESULTADOS (ajusta rutas!) */
import { CreateResult } from '../../results/create-result/create-result';  // ⬅️ AJUSTA ruta real
import type { ParamDef } from '../../results/create-result/create-result'; // ⬅️ AJUSTA ruta real

export type SampleStatus = 'pendiente' | 'tomada' | 'rechazada' | 'enviada' | 'archivada';

export interface SampleDetail {
  id: string;
  codigoBarra?: string | null;
  tipo: string;
  ordenId: string;
  ordenNumero?: string;
  fechaToma?: string | Date | null;
  estado: SampleStatus;
  observacion?: string | null;

  // opcionales visuales
  paciente?: string;
  pacienteDoc?: string;
  medico?: string;
  aseguradora?: string | null;
  creadoEn?: string | Date;
  actualizadoEn?: string | Date;
}

/** Exámenes que usan esta muestra (si hay varios) */
export interface SampleExamLink {
  examenId: string;        // ej. 'ex-glu'
  nombre: string;          // ej. 'Glucosa'
  ordenExamenId: string;   // ej. 'OE-ORD-001-ex-glu'
}

@Component({
  selector: 'app-view-sample',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // necesario para [(ngModel)]
    DialogModule, ButtonModule, TagModule, DividerModule, TooltipModule, SelectModule,
    CreateResult, // ⬅️ integra el diálogo hijo
  ],
  templateUrl: './view-sample.html',
  styleUrls: ['./view-sample.css'],
})
export class ViewSample {
  /* ====== Inputs / Outputs ====== */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Muestra a visualizar */
  @Input() sample: SampleDetail | null = null;

  /** Lista opcional de exámenes ligados a la muestra (si hay varios) */
  @Input() examsForSample: SampleExamLink[] | null = null;

  /** Para overlays */
  @Input() appendToBody = true;

  /** Acciones externas (opcionales) */
  @Output() edit = new EventEmitter<SampleDetail>();
  @Output() print = new EventEmitter<SampleDetail>();
  @Output() close = new EventEmitter<void>();

  /* ====== Estado local ====== */
  selectedExamId: string | null = null;

  // Estado del diálogo hijo (CreateResult)
  showCreateResult = false;
  ctxOrdenExamenId = '';
  ctxParams: ParamDef[] = [];

  // Catálogo estático de parámetros por examen (mock)
  parametrosPorExamen: Record<string, ParamDef[]> = {
    'ex-glu': [
      { parametroId:'GLU', nombre:'Glucosa', tipo:'num',  unidad:'mg/dL', refMin:70, refMax:100, posicion:1 },
      { parametroId:'OBS', nombre:'Observación', tipo:'texto', posicion:2 },
    ],
    'ex-col': [
      { parametroId:'COLT', nombre:'Colesterol Total', tipo:'num', unidad:'mg/dL', refMin:0, refMax:200, posicion:1 },
    ],
  };

  // Fallback para asegurar campos aunque no haya params configurados
  defaultParams: ParamDef[] = [
    { parametroId:'VAL', nombre:'Valor', tipo:'num', unidad:'u', refMin:0, refMax:100, posicion:1 },
    { parametroId:'OBS', nombre:'Observación', tipo:'texto', posicion:2 },
  ];

  /* ====== Helpers ====== */
  getStatusSeverity(s: SampleStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (s) {
      case 'tomada':    return 'success';
      case 'enviada':   return 'info';
      case 'pendiente': return 'warn';
      case 'rechazada':
      case 'archivada': return 'danger';
    }
  }

  onHide() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.close.emit();
  }
  onEdit()  { if (this.sample) this.edit.emit(this.sample); }
  onPrint() { if (this.sample) this.print.emit(this.sample); }

  /* ====== Abrir CreateResult SIN contenedor ====== */
  onAddResultsSimple() {
    if (!this.sample) return;
    // Para demo: asumimos examen "Glucosa"
    this.ctxOrdenExamenId = `OE-${this.sample.ordenId}-ex-glu`;
    const p = this.parametrosPorExamen['ex-glu'] ?? [];
    this.ctxParams = p.length ? p : this.defaultParams;  // fallback
    // debug opcional:
    // console.log('open dialog (simple)', { id: this.ctxOrdenExamenId, params: this.ctxParams });
    this.showCreateResult = true;
  }

  onAddResultsWithExam() {
    if (!this.sample || !(this.examsForSample?.length)) return;
    const ex = this.examsForSample.find(x => x.examenId === this.selectedExamId) ?? this.examsForSample[0];
    this.ctxOrdenExamenId = ex.ordenExamenId;
    const p = this.parametrosPorExamen[ex.examenId] ?? [];
    this.ctxParams = p.length ? p : this.defaultParams;  // fallback
    // console.log('open dialog (exam)', { id: this.ctxOrdenExamenId, params: this.ctxParams });
    this.showCreateResult = true;
  }

  /* Callbacks del diálogo interno (demo) */
  onCreateResults(payload: any) {
    console.log('Resultados creados (mock):', payload);
    this.showCreateResult = false;
  }
  onCancelCreate() { this.showCreateResult = false; }
}
