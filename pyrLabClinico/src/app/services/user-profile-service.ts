// src/app/services/user-profile.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { SessionService } from '../auth/session-service';
import { UsersService } from './user-service';          // ⬅️ ajusta ruta/nombre si difiere
import { PatientsService } from './patient-service';    // ⬅️ ajusta si difiere
import { DoctorsService } from './doctor-service';      // ⬅️ ajusta si difiere

import { UserI } from '../models/user-model';            // ⬅️ ajusta si difiere
import { PatientI } from '../models/patient-model';      // ⬅️ ajusta si difiere
import { DoctorI } from '../models/doctor-model';        // ⬅️ ajusta si difiere

export type Profile = PatientI | DoctorI | undefined;

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  constructor(
    private session: SessionService,
    private users: UsersService,
    private patients: PatientsService,
    private doctors: DoctorsService
  ) {}

  /** Usuario actual (desde UsersService usando el ID de SessionService) */
  currentUser$(): Observable<UserI | undefined> {
    const id = this.session.currentUserId;
    if (!id) return of(undefined);
    return this.users.getById(id);
  }

  /** Perfil actual (Patient o Doctor) según el rol guardado en la sesión */
  currentProfile$(): Observable<Profile> {
    const id = this.session.currentUserId;
    const role = (this.session.currentUserRole || '').toUpperCase();

    if (!id || !role) return of(undefined);
    if (role === 'PATIENT') return this.patients.getByUserId(id);
    if (role === 'DOCTOR')  return this.doctors.getByUserId(id);
    return of(undefined);
  }

  /** Nombre para mostrar: intenta con perfil; si no hay, cae a username */
  displayName$(): Observable<string> {
    return combineLatest([this.currentProfile$(), this.currentUser$()]).pipe(
      map(([profile, user]) => {
        // Paciente → firstName + lastName
        if (profile && 'firstName' in profile) {
          const full = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
          if (full) return full;
        }
        // Doctor → name
        if (profile && 'name' in profile && profile.name) {
          return profile.name;
        }
        // Fallback → username o "Usuario"
        return user?.username ?? 'Usuario';
      })
    );
  }

  /** Rol para mostrar: del usuario actual (o de la sesión como fallback) */
  displayRole$(): Observable<string> {
    return this.currentUser$().pipe(
      map(u => u?.role ?? (this.session.currentUserRole ?? 'ROL'))
    );
  }
}
