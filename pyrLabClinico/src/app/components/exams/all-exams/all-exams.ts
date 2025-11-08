import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { switchMap, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';

import { ExamsService } from '../../../services/exam-service';
import { ExamI, SpecimenType } from '../../../models/exam-model';
import { CreateExam } from '../create-exam/create-exam';
import { UpdateExam } from '../update-exam/update-exam';
import { ViewExam } from '../view-exam/view-exam';

@Component({
  selector: 'app-exams-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, SelectModule, DialogModule,
    CreateExam, UpdateExam, ViewExam
  ],
  templateUrl: './all-exams.html'
})
export class AllExams implements OnInit {
  private fb = inject(FormBuilder);
  private examsSvc = inject(ExamsService);

  // === estado del diálogo de crear ===
  showCreateExam = false;
  openCreateExam() { this.showCreateExam = true; }
  closeCreateExam() { this.showCreateExam = false; }
  onExamCreated(_exam: ExamI) {
    this.closeCreateExam();
    this.reloadExams();
  }
  showEditExam = false;
  selectedExamId?: number;

  // Filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    status: this.fb.control<'ACTIVE' | 'INACTIVE' | undefined>(undefined),
    specimenType: this.fb.control<SpecimenType | undefined>(undefined)
  });

  statusOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Activo', value: 'ACTIVE' as const },
    { label: 'Inactivo', value: 'INACTIVE' as const },
  ];

  specimenOptions = [
    { label: 'Todos', value: undefined },
    { label: 'Sangre', value: 'SANGRE' as const },
    { label: 'Suero', value: 'SUERO' as const },
    { label: 'Plasma', value: 'PLASMA' as const },
    { label: 'Orina', value: 'ORINA' as const },
    { label: 'Saliva', value: 'SALIVA' as const },
    { label: 'Heces', value: 'HECES' as const },
    { label: 'Tejido', value: 'TEJIDO' as const },
    { label: 'Otra', value: 'OTRA' as const },
  ];

  // Filtrado reactivo
  rows$: Observable<ExamI[]> = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    switchMap(v => this.examsSvc.list({
      q: v.q || undefined,
      status: v.status || undefined,
      specimenType: v.specimenType || undefined
    }))
  );

  clearFilters(): void {
    this.form.reset({ q: '', status: undefined, specimenType: undefined });
  }

  statusTag(s?: 'ACTIVE' | 'INACTIVE'): 'success' | 'danger' | undefined {
    switch (s) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'danger';
      default: return undefined;
    }
  }

  onDelete(id: number): void {
    this.deleteExam(id);
  }

  openEditExam(id: number) {
    this.selectedExamId = id;
    this.showEditExam = true;
  }
  closeEditExam() {
    this.showEditExam = false;
    this.selectedExamId = undefined;
  }
  onExamSaved(_exam: ExamI) {
    this.closeEditExam();
    this.reloadExams();
  }

  // ====== VER ======
  showViewExam = false;
  openViewExam(id: number) { this.selectedExamId = id; this.showViewExam = true; }
  closeViewExam() { this.showViewExam = false; this.selectedExamId = undefined; }
  onViewEdit(id: number) { this.closeViewExam(); this.openEditExam(id); }
  onViewDelete(id: number) { this.deleteExam(id, () => this.closeViewExam()); }

  ngOnInit(): void {
    this.reloadExams();
  }

  private reloadExams(): void {
    this.examsSvc.refresh().subscribe({
      error: err => console.error('[AllExams] reload failed', err)
    });
  }

  private deleteExam(id: number, onSuccess?: () => void): void {
    const ok = confirm(`¿Eliminar el examen #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.examsSvc.remove(id).subscribe(changed => {
      if (!changed) {
        console.error('No se pudo eliminar el examen', id);
        return;
      }
      this.reloadExams();
      onSuccess?.();
    });
  }
}
