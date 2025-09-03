// view-result.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/* PrimeNG */
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

type ParamTipo = 'num' | 'texto' | 'bool';
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
  validado?: boolean;
}

@Component({
  selector: 'app-view-result',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule, TableModule],
  templateUrl: './view-result.html',
})
export class ViewResult {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() items: ResultItem[] = [];   // bundle del mismo ordenExamenId
  @Output() close = new EventEmitter<void>();

  get ordenExamenId(): string { return this.items?.[0]?.ordenExamenId ?? ''; }

  onHide(){ this.visible=false; this.visibleChange.emit(false); this.close.emit(); }
}
