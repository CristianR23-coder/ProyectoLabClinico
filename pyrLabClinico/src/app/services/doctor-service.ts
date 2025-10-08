// src/app/services/doctors.service.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DoctorI } from '../models/doctor-model';
import { UsersService } from './user-service';

export interface DoctorListParams { q?: string; status?: 'ACTIVE'|'INACTIVE'; }

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private users = inject(UsersService);

  private readonly INITIAL: DoctorI[] = [
    { id: 80,  userId: undefined, docNumber: 'M-998', name: 'Dr. Lopez', specialty: 'Medicina interna', status: 'ACTIVE',  phone: '3001234567', email: 'lopez@demo.com' },
    { id: 81,  userId: undefined, docNumber: 'M-777', name: 'Dr. Ruiz',  specialty: 'Pediatría',        status: 'ACTIVE' },
    { id: 120, userId: undefined, docNumber: 'M-555', name: 'Dra. Mora', specialty: 'Cardiología',      status: 'INACTIVE' },
  ];
  private readonly _items$ = new BehaviorSubject<DoctorI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: DoctorListParams): Observable<DoctorI[]> {
    return this.items$.pipe(delay(120), map(items => this.applyFilters(items, params)));
  }

  /** 🔹 al crear doctor, crea user (username=nombre+apellido, pass=docNumber) y vincula userId */
  add(partial: Omit<DoctorI,'id'|'userId'> & { id?: number }): Observable<DoctorI> {
    const nextId = this.generateId();
    const tmp: DoctorI = { ...partial, id: partial.id ?? nextId };

    const user = this.users.createForDoctor({
      name: tmp.name, docNumber: tmp.docNumber, status: tmp.status
    });

    const d: DoctorI = { ...tmp, userId: user.id };

    this._items$.next([d, ...this._items$.value]);
    return of(d).pipe(delay(80));
  }

  update(id: number, patch: Partial<DoctorI>): Observable<DoctorI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return of(undefined).pipe(delay(50));
    const prev = arr[idx];
    const updated = { ...prev, ...patch };

    if (prev.userId && patch.docNumber && patch.docNumber !== prev.docNumber) {
      this.users.updatePassword(prev.userId, patch.docNumber);
    }

    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(80));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const toRemove = arr.find(d => d.id === id);
    const filtered = arr.filter(x => x.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) {
      this._items$.next(filtered);
      if (toRemove?.userId) this.users.setStatus(toRemove.userId, 'INACTIVE');
    }
    return of(changed).pipe(delay(60));
  }

  getById(id: number): Observable<DoctorI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.id === id)), delay(50));
  }
  getByUserId(userId: number): Observable<DoctorI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.userId === userId)), delay(50));
  }

  // helpers (sin cambios)
  private applyFilters(items: DoctorI[], params?: DoctorListParams): DoctorI[] { /* ... tu mismo código ... */ return items; }
  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1;
    return max + 1;
  }
}
