import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

import { PatientsService } from '../../../services/patient-service';
import { PatientI } from '../../../models/patient-model';

import { CreatePatient } from '../create-patient/create-patient';
import { UpdatePatient } from '../update-patient/update-patient';
import { ViewPatient } from '../view-patient/view-patient';

type Status = 'ACTIVE' | 'INACTIVE';

@Component({
  selector: 'app-all-patients',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, InputTextModule, ButtonModule, TagModule, DialogModule,
    CreatePatient, UpdatePatient, ViewPatient
  ],
  templateUrl: './all-patients.html'
})
export class AllPatients {
  private fb = inject(FormBuilder);
  private svc = inject(PatientsService);

  // diálogos
  showCreate = false;
  showEdit = false;
  showView = false;

  selectedId?: number;
  viewedId?: number;

  // filtros
  form = this.fb.group({
    q: this.fb.control<string>(''),
    status: this.fb.control<Status | undefined>(undefined)
  });

  readonly rows$ = this.form.valueChanges.pipe(
    startWith(this.form.getRawValue()),
    switchMap(v => this.svc.list({ q: v?.q || undefined, status: v?.status || undefined }))
  );

  // ui helpers
  clear() { this.form.reset({ q: '', status: undefined }); }

  tagSeverity(s?: Status): 'success'|'danger'|'secondary'|undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }
  isStatus(s?: Status) { return this.form.controls.status.value === s; }

  // modales
  openCreate(){ this.showCreate = true; }
  closeCreate(){ this.showCreate = false; }
  onCreated(){ this.closeCreate(); }

  openEdit(id:number){ this.selectedId = id; this.showEdit = true; }
  closeEdit(){ this.showEdit = false; this.selectedId = undefined; }
  onEdited(){ this.closeEdit(); }

  openView(id:number){ this.viewedId = id; this.showView = true; }
  closeView(){ this.showView = false; this.viewedId = undefined; }

  onViewEdit(id:number){ this.closeView(); this.openEdit(id); }
  onViewDelete(id:number){
    const ok = confirm(`¿Eliminar el paciente #${id}?`);
    if (!ok) return;
    this.svc.remove(id).subscribe(() => this.closeView());
  }
}
