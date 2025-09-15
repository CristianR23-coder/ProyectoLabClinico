// src/app/results/view-result/view-result.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

import { ResultsService } from '../../../services/result-service';
import { ParameterService } from '../../../services/parameter-service';
import { ExamsService } from '../../../services/exam-service';
import { SamplesService } from '../../../services/sample-service';
import { DoctorsService } from '../../../services/doctor-service';

import { ResultI, ResultState } from '../../../models/result-model';
import { ParameterI } from '../../../models/parameter-model';
import { ExamI } from '../../../models/exam-model';
import { SampleI } from '../../../models/sample-model';
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-view-result',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './view-result.html'
})
export class ViewResult implements OnInit {
  @Input() resultId?: number;

  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  private resultsSvc = inject(ResultsService);
  private paramsSvc = inject(ParameterService);
  private examsSvc = inject(ExamsService);
  private samplesSvc = inject(SamplesService);
  private doctorsSvc = inject(DoctorsService);

  result?: ResultI;
  param?: ParameterI;
  exam?: ExamI;
  sample?: SampleI;
  doctor?: DoctorI;
  loading = true;

  ngOnInit(): void {
    if (!this.resultId) { this.loading = false; return; }
    this.resultsSvc.getById(this.resultId).subscribe(r => {
      this.result = r ?? undefined;
      this.loading = false;
      if (!r) return;

      this.paramsSvc.getById(r.parameterId).subscribe(p => this.param = p ?? undefined);
      this.examsSvc.getById(r.examId).subscribe(e => this.exam = e ?? undefined);
      this.samplesSvc.getById(r.sampleId).subscribe(s => this.sample = s ?? undefined);
      if (r.validatedForId != null) {
        this.doctorsSvc.getById(r.validatedForId).subscribe(d => this.doctor = d ?? undefined);
      }
    });
  }

  tagSeverity(s?: ResultState): 'warning' | 'info' | 'success' | 'danger' | undefined {
    switch (s) {
      case 'PENDIENTE': return 'warning';
      case 'VALIDADO':  return 'success';
      case 'RECHAZADO': return 'danger';
      default: return undefined;
    }
  }

  requestEdit() { if (this.result?.id) this.editRequested.emit(this.result.id); }
  requestDelete() { if (this.result?.id) this.deleteRequested.emit(this.result.id); }
  close() { this.closed.emit(); }
}
