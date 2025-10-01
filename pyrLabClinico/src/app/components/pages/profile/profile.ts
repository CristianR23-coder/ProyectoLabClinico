// src/app/components/profile/user-profile-dialog.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

import { UserProfileService } from '../../../services/user-profile-service'; // ajusta ruta
import { PatientI } from '../../../models/patient-model';                    // ajusta rutas
import { DoctorI } from '../../../models/doctor-model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, DialogModule, CardModule, TagModule, ButtonModule, DividerModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'] // opcional
})
export class Profile {
  /** Control externo del diálogo (two-way binding) */
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  /** Donde renderizar el overlay (evita clipping) */
  @Input() appendTo: any = 'body';
  @Input() baseZIndex = 11000;

  /** Eventos (el padre decide a dónde navegar) */
  @Output() editRequested = new EventEmitter<{ role: 'PATIENT'|'DOCTOR', id: number }>();
  @Output() deleteRequested = new EventEmitter<{ role: 'PATIENT'|'DOCTOR', id: number }>();

  private up = inject(UserProfileService);

  // Observables para el template
  name$    = this.up.displayName$();
  role$    = this.up.displayRole$();
  profile$ = this.up.currentProfile$();

  // helpers
  isPatient(p: any): p is PatientI { return p && 'firstName' in p; }
  isDoctor(p: any): p is DoctorI  { return p && 'name' in p && !('firstName' in p); }

  severity(s?: 'ACTIVE'|'INACTIVE'): 'success'|'danger'|'secondary'|undefined {
    if (s === 'ACTIVE') return 'success';
    if (s === 'INACTIVE') return 'danger';
    return 'secondary';
  }

  onEdit(p: PatientI | DoctorI) {
    const role = this.isPatient(p) ? 'PATIENT' : 'DOCTOR';
    if (p?.id) this.editRequested.emit({ role, id: p.id });
  }
  onDelete(p: PatientI | DoctorI) {
    const role = this.isPatient(p) ? 'PATIENT' : 'DOCTOR';
    if (p?.id) this.deleteRequested.emit({ role, id: p.id });
  }
}
