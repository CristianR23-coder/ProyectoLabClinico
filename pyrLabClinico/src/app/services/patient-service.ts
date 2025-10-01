// src/app/services/patients.service.ts  (ajusta la ruta real)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { PatientI } from '../models/patient-model';
import { InsuranceI } from '../models/insurance-model';
import { UsersService } from '../services/user-service';
import { UserI } from '../models/user-model';

export interface PatientListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private INS: InsuranceI[] = [
    { id: 7, name: 'Health Plus', nit: '900.123.456', status: 'ACTIVE' },
    { id: 8, name: 'Care One',    nit: '901.777.111', status: 'ACTIVE' }
  ];

  private readonly INITIAL: PatientI[] = [
    {
      id: 501, docType: 'CC', docNumber: '123456',
      firstName: 'Ana', lastName: 'Perez',
      phone: '3001234567', email: 'ana@demo.com',
      status: 'ACTIVE',
      insurance: this.INS[0],
      userId: 1 // ← enlaza con UsersService (pac-123456)
    },
    {
      id: 502, docType: 'CC', docNumber: '789012',
      firstName: 'Luis', lastName: 'Gomez',
      status: 'ACTIVE'
      // sin usuario aún
    },
    {
      id: 503, docType: 'CE', docNumber: 'A-556677',
      firstName: 'María', lastName: 'Rojas',
      status: 'INACTIVE',
      insurance: this.INS[1]
      // sin usuario aún
    }
  ];

  private readonly _items$ = new BehaviorSubject<PatientI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  constructor(private users: UsersService) {}

  list(params?: PatientListParams): Observable<PatientI[]> {
    return this.items$.pipe(delay(80), map(items => this.applyFilters(items, params)));
  }

  /** Lista "enriquecida" con user (si hay userId) */
  listWithUsers(params?: PatientListParams): Observable<PatientI[]> {
    return combineLatest([this.list(params), this.users.list()]).pipe(
      map(([patients, users]) =>
        patients.map(p => ({ ...p, user: p.userId ? users.find(u => u.id === p.userId) : undefined }))
      )
    );
  }

  add(partial: Omit<PatientI, 'id'> & { id?: number }): Observable<PatientI> {
    const nextId = this.generateId();
    const p: PatientI = { ...partial, id: partial.id ?? nextId };
    this._items$.next([p, ...this._items$.value]);
    return of(p).pipe(delay(60));
  }

  update(id: number, patch: Partial<PatientI>): Observable<PatientI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return of(undefined).pipe(delay(40));
    const updated = { ...arr[idx], ...patch };
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(60));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const filtered = arr.filter(x => x.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._items$.next(filtered);
    return of(changed).pipe(delay(40));
  }

  getById(id: number): Observable<PatientI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.id === id)), delay(30));
  }

  /** 🔗 buscar paciente por usuario (userId) */
  getByUserId(userId: number): Observable<PatientI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.userId === userId)), delay(30));
  }

  /** 🔗 vincular usuario a paciente */
  linkUser(patientId: number, userId: number): Observable<PatientI | undefined> {
    return this.update(patientId, { userId });
  }

  /** 🔗 desvincular usuario de paciente */
  unlinkUser(patientId: number): Observable<PatientI | undefined> {
    return this.update(patientId, { userId: undefined, user: undefined });
  }

  // helpers
  private applyFilters(items: PatientI[], params?: PatientListParams): PatientI[] {
    let out = items;
    if (params?.status) out = out.filter(r => r.status === params.status);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const fn = r.firstName?.toLowerCase() ?? '';
        const ln = r.lastName?.toLowerCase() ?? '';
        const doc = r.docNumber?.toLowerCase() ?? '';
        const email = r.email?.toLowerCase() ?? '';
        const phone = r.phone?.toLowerCase() ?? '';
        const ins = r.insurance?.name?.toLowerCase() ?? '';
        return (
          fn.includes(q) || ln.includes(q) || `${fn} ${ln}`.includes(q)
          || doc.includes(q) || email.includes(q) || phone.includes(q) || ins.includes(q)
        );
      });
    }
    return [...out].sort((a, b) => (a.lastName ?? '').localeCompare(b.lastName ?? '') || (a.firstName ?? '').localeCompare(b.firstName ?? ''));
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1;
    return max + 1;
  }
}
