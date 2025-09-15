import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DoctorI } from '../models/doctor-model';

export interface DoctorListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private readonly INITIAL: DoctorI[] = [
    { id: 80,  docNumber: 'M-998', name: 'Dr. Lopez', specialty: 'Medicina interna', status: 'ACTIVE',  phone: '3001234567', email: 'lopez@demo.com' },
    { id: 81,  docNumber: 'M-777', name: 'Dr. Ruiz',  specialty: 'Pediatría',        status: 'ACTIVE' },
    { id: 120, docNumber: 'M-555', name: 'Dra. Mora', specialty: 'Cardiología',      status: 'INACTIVE' },
  ];

  private readonly _items$ = new BehaviorSubject<DoctorI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: DoctorListParams): Observable<DoctorI[]> {
    return this.items$.pipe(delay(120), map(items => this.applyFilters(items, params)));
  }

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

  // helpers
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
