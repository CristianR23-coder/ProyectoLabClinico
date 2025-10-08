// src/app/services/patients.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PatientI } from '../models/patient-model';
import { UsersService } from './user-service';

export interface PatientListParams { q?: string; status?: 'ACTIVE'|'INACTIVE'; }

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private users = inject(UsersService);

  private readonly INITIAL: PatientI[] = [
    // recuerda añadir userId si ya quieres arrancar con alguno vinculado
    { id: 501, userId: undefined, docType:'CC', docNumber:'123456', firstName:'Ana', lastName:'Perez',
      phone:'3001234567', email:'ana@demo.com', status:'ACTIVE' }
  ];
  private readonly _items$ = new BehaviorSubject<PatientI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: PatientListParams): Observable<PatientI[]> {
    return this.items$.pipe(delay(120), map(items => this.applyFilters(items, params)));
  }

  /** 🔹 al crear paciente, crea user (username=nombre+apellido, pass=docNumber) y vincula userId */
  add(partial: Omit<PatientI,'id'|'userId'> & { id?: number }): Observable<PatientI> {
    const nextId = this.generateId();
    const tmp: PatientI = { ...partial, id: partial.id ?? nextId };

    // 1) crear usuario
    const user = this.users.createForPatient({
      firstName: tmp.firstName, lastName: tmp.lastName, docNumber: tmp.docNumber, status: tmp.status
    });

    // 2) vincular userId al paciente
    const p: PatientI = { ...tmp, userId: user.id };

    // 3) persistir en el mock
    this._items$.next([p, ...this._items$.value]);
    return of(p).pipe(delay(80));
  }

  /** si cambia docNumber, actualiza password del usuario vinculado */
  update(id: number, patch: Partial<PatientI>): Observable<PatientI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return of(undefined).pipe(delay(50));

    const prev = arr[idx];
    const updated = { ...prev, ...patch };

    // sincroniza password del user si cambió docNumber
    if (prev.userId && patch.docNumber && patch.docNumber !== prev.docNumber) {
      this.users.updatePassword(prev.userId, patch.docNumber);
    }

    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(80));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const toRemove = arr.find(p => p.id === id);
    const filtered = arr.filter(x => x.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) {
      this._items$.next(filtered);
      // opcional: desactivar usuario vinculado
      if (toRemove?.userId) this.users.setStatus(toRemove.userId, 'INACTIVE');
    }
    return of(changed).pipe(delay(60));
  }

  getById(id: number): Observable<PatientI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.id === id)), delay(50));
  }
  getByUserId(userId: number): Observable<PatientI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.userId === userId)), delay(50));
  }

  // helpers (sin cambios)
  private applyFilters(items: PatientI[], params?: PatientListParams): PatientI[] { /* ... tu mismo código ... */ return items; }
  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1;
    return max + 1;
  }
}
