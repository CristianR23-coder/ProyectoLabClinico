import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

import { ExamsService } from '../../../services/exam-service';
import { ExamI } from '../../../models/exam-model';

@Component({
  selector: 'app-view-exam',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './view-exam.html'
})
export class ViewExam implements OnInit {
  @Input() examId?: number;

  /** Eventos para que el padre maneje edición/eliminación/cierre */
  @Output() editRequested = new EventEmitter<number>();
  @Output() deleteRequested = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  private route = inject(ActivatedRoute);
  private examsSvc = inject(ExamsService);

  exam?: ExamI;
  loading = true;

  ngOnInit(): void {
    // Si no llega por @Input, intenta tomarlo de la ruta /exams/:id
    if (this.examId == null) {
      const idParam = this.route.snapshot.paramMap.get('id');
      this.examId = idParam ? Number(idParam) : undefined;
    }
    if (!this.examId || Number.isNaN(this.examId)) { this.loading = false; return; }

    this.examsSvc.getById(this.examId).subscribe(ex => {
      this.exam = ex;
      this.loading = false;
    });
  }

  tagSeverity(s?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | undefined {
    switch (s) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      default: return undefined;
    }
  }

  requestEdit(): void {
    if (this.exam?.id) this.editRequested.emit(this.exam.id);
  }

  requestDelete(): void {
    if (this.exam?.id) this.deleteRequested.emit(this.exam.id);
  }

  close(): void {
    this.closed.emit();
  }
}
