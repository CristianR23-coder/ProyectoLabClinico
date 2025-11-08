import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { DoctorsService } from '../../../services/doctor-service'; // ajusta ruta si difiere
import { DoctorI } from '../../../models/doctor-model';

// Hijos (diálogos)
import { CreateDoctor } from '../create-doctor/create-doctor';
import { UpdateDoctor } from '../update-doctor/update-doctor';
import { ViewDoctor } from '../view-doctor/view-doctor';

type Status = 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-all-doctors',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule,
    CreateDoctor, UpdateDoctor, ViewDoctor
  ],
  templateUrl: './all-doctors.html'
})
export class AllDoctors implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(DoctorsService);

  // Diálogos
  showCreate = false;
  showEdit = false;
  showView = false;

  selectedId?: number; // para editar
  viewedId?: number;   // para ver

  // Filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    status: this.fb.control<Status | undefined>(undefined)
  });

  // Data
  readonly rows$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    switchMap(v =>
      this.svc.list({
        q: v?.q || undefined,
        status: (v?.status as Status | undefined) || undefined
      })
    )
  );

  // UI
  ngOnInit(): void {
    this.reloadDoctors();
  }

  clear(): void {
    this.form.reset({ q: '', status: undefined });
  }

  tagSeverity(s?: Status): 'success' | 'danger' | 'secondary' | undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  // Modales
  openCreate(): void { this.showCreate = true; }
  closeCreate(): void { this.showCreate = false; }
  onCreated(): void {
    this.closeCreate();
    this.reloadDoctors();
  }

  openEdit(id: number): void { this.selectedId = id; this.showEdit = true; }
  closeEdit(): void { this.showEdit = false; this.selectedId = undefined; }
  onEdited(): void {
    this.closeEdit();
    this.reloadDoctors();
  }

  openView(id: number): void { this.viewedId = id; this.showView = true; }
  closeView(): void { this.showView = false; this.viewedId = undefined; }

  onViewEdit(id: number): void {
    this.closeView();
    this.openEdit(id);
  }

  onViewDelete(id: number): void {
    const ok = confirm(`¿Eliminar el médico #${id}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    this.svc.remove(id).subscribe(success => {
      if (success) {
        this.closeView();
        this.reloadDoctors();
      }
    });
  }

  // Para los botones de filtro con estilo dinámico
  isStatus(s?: Status): boolean {
    return this.form.controls.status.value === s;
  }

  private reloadDoctors(): void {
    this.svc.refresh().subscribe({
      error: err => console.error('[AllDoctors] reloadDoctors failed', err)
    });
  }
}
