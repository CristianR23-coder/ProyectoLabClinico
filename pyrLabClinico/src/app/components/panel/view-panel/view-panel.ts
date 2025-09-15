import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { PanelsService } from '../../../services/panel-service';
import { PanelI } from '../../../models/panel-model';
import { ExamsService } from '../../../services/exam-service';
import { ParameterService } from '../../../services/parameter-service'; // ajusta ruta
import { ExamI } from '../../../models/exam-model';
import { ParameterI } from '../../../models/parameter-model';

@Component({
  selector: 'app-view-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule, DividerModule, TableModule, TagModule],
  templateUrl: './view-panel.html'
})
export class ViewPanel implements OnInit {
  @Input({ required: true }) panelId!: number;
  @Output() closed = new EventEmitter<void>();

  private svc = inject(PanelsService);
  private examsSvc = inject(ExamsService);
  private paramsSvc = inject(ParameterService);

  loading = true;
  panel?: PanelI;

  // Mapas seguros (solo indexamos si id != null)
  exams: Record<number, string> = {};
  params: Record<number, string> = {};

  ngOnInit(): void {
    // precargar nombres con guardas
    this.examsSvc.list().subscribe((xs: ExamI[] | undefined) => {
      xs?.forEach(e => {
        if (e && e.id != null) {
          this.exams[e.id] = e.name ?? `Examen #${e.id}`;
        }
      });
    });

    this.paramsSvc.list().subscribe((ps: ParameterI[] | undefined) => {
      ps?.forEach(p => {
        if (p && p.id != null) {
          this.params[p.id] = p.name ?? `Parámetro #${p.id}`;
        }
      });
    });

    this.svc.getById(this.panelId).subscribe(p => {
      this.panel = p ?? undefined;
      this.loading = false;
    });
  }

  nameForItem(it: any): string {
    if (!it) return '—';
    if (it.kind === 'EXAM') {
      const id = it.examId as (number | undefined);
      if (id == null) return '—';
      return this.exams[id] ?? `Examen #${id}`;
    } else {
      const id = it.parameterId as (number | undefined);
      if (id == null) return '—';
      return this.params[id] ?? `Parámetro #${id}`;
    }
  }
}
