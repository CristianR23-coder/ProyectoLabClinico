// all-result.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

/* PrimeNG v20 */
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export type ParamTipo = 'num' | 'texto' | 'bool';

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
  validado?: boolean;
}

/* ========= MOCKS ========= */
const MOCK_RESULTS: ResultItem[] = [
  { id:'r1', ordenExamenId:'OE-001', parametroId:'GLU', tipo:'num',  valorNum:92, unidad:'mg/dL', refMin:70, refMax:100, validado:true },
  { id:'r2', ordenExamenId:'OE-001', parametroId:'OBS', tipo:'texto',valorTexto:'Ayunas', validado:true },
  { id:'r3', ordenExamenId:'OE-002', parametroId:'HDL', tipo:'num',  valorNum:48, unidad:'mg/dL', refMin:40, refMax:60, validado:false },
  { id:'r4', ordenExamenId:'OE-002', parametroId:'LDL', tipo:'num',  valorNum:130, unidad:'mg/dL', refMin:0,  refMax:130, validado:false },
  { id:'r5', ordenExamenId:'OE-003', parametroId:'COVID', tipo:'bool',valorBool:false, validado:true },
];

@Component({
  selector: 'app-all-result',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule],
  templateUrl: './all-result.html',
})
export class AllResult {
  @Input() results: ResultItem[] = [...MOCK_RESULTS];
  @Input() pageSize = 10;

  @Output() viewGroup = new EventEmitter<ResultItem[]>();   // por ordenExamen
  @Output() editGroup = new EventEmitter<ResultItem[]>();   // por ordenExamen
  @Output() removeItem = new EventEmitter<string>();        // elimina 1 item

  @ViewChild('dt') dt!: Table;

  globalQuery = '';
  globalFields = ['ordenExamenId', 'parametroId', 'unidad'];

  getSeverity(r: ResultItem): 'success' | 'info' { return r.validado ? 'success' : 'info'; }

  clearSearch() { this.globalQuery = ''; this.dt?.clear(); }

  getGroup(oeId: string) { return this.results.filter(r => r.ordenExamenId === oeId); }
}
