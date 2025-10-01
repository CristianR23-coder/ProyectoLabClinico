// src/app/services/doctors.service.ts  (ajusta la ruta real de tu proyecto)
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DoctorI } from '../models/doctor-model';
import { UsersService } from '../services/user-service';     // ajusta ruta si difiere
import { UserI } from '../models/user-model';               // ajusta ruta si difiere

export interface DoctorListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly INITIAL: DoctorI[] = [
    { id: 80,  docNumber: 'M-998', name: 'Dr. Lopez', specialty: 'Medicina interna', status: 'ACTIVE',  phone: '3001234567', email: 'lopez@demo.com', userId: 2 /* ← enlaza con un usuario DOCTOR */ },
    { id: 81,  docNumber: 'M-777', name: 'Dr. Ruiz',  specialty: 'Pediatría',        status: 'ACTIVE' },
    { id: 120, docNumber: 'M-555', name: 'Dra. Mora', specialty: 'Cardiología',      status: 'INACTIVE' },
  ];

  private readonly _items$ = new BehaviorSubject<DoctorI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  constructor(private users: UsersService) {}

  // ====== Listas ======
  list(params?: DoctorListParams): Observable<DoctorI[]> {
    return this.items$.pipe(delay(120), map(items => this.applyFilters(items, params)));
  }

  /** Lista enriquecida con el objeto `user` (si existe userId). */
  listWithUsers(params?: DoctorListParams): Observable<DoctorI[]> {
    return combineLatest([this.list(params), this.users.list()]).pipe(
      map(([doctors, users]) =>
        doctors.map(d => ({
          ...d,
          user: d.userId ? users.find(u => u.id === d.userId) : undefined
        }))
      )
    );
  }

  // ====== CRUD ======
  add(partial: Omit<DoctorI,'id'> & { id?: number }): Observable<DoctorI> {
    const nextId = this.generateId();
    const d: DoctorI = { ...partial, id: partial.id ?? nextId };
    this._items$.next([d, ...this._items$.value]);
    return of(d).pipe(delay(80));
  }

  update(id: number, patch: Partial<DoctorI>): Observable<DoctorI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return of(undefined).pipe(delay(50));
    const updated = { ...arr[idx], ...patch };
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(80));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const filtered = arr.filter(x => x.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._items$.next(filtered);
    return of(changed).pipe(delay(60));
  }

  getById(id: number): Observable<DoctorI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.id === id)), delay(50));
  }

  /** 🔎 obtener doctor por userId (para perfilar al entrar con usuario DOCTOR) */
  getByUserId(userId: number): Observable<DoctorI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.userId === userId)), delay(40));
  }

  /** 🔗 vincular usuario a un doctor */
  linkUser(doctorId: number, userId: number): Observable<DoctorI | undefined> {
    return this.update(doctorId, { userId });
  }

  /** 🔗 desvincular usuario de un doctor */
  unlinkUser(doctorId: number): Observable<DoctorI | undefined> {
    return this.update(doctorId, { userId: undefined, user: undefined });
  }

  // ====== helpers ======
  private applyFilters(items: DoctorI[], params?: DoctorListParams): DoctorI[] {
    let out = items;
    if (params?.status) out = out.filter(r => r.status === params.status);
    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const name = r.name?.toLowerCase() ?? '';
        const doc = r.docNumber?.toLowerCase() ?? '';
        const spec = r.specialty?.toLowerCase() ?? '';
        const email = r.email?.toLowerCase() ?? '';
        const phone = r.phone?.toLowerCase() ?? '';
        return name.includes(q) || doc.includes(q) || spec.includes(q) || email.includes(q) || phone.includes(q);
      });
    }
    return [...out].sort((a,b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1;
    return max + 1;
  }
}
