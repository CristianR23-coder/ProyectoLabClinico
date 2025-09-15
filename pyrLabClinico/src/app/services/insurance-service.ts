import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { InsuranceI } from '../models/insurance-model';

export interface InsuranceListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class InsurancesService {
  private readonly INITIAL: InsuranceI[] = [
    { id: 7, name: 'Health Plus', nit: '900.123.456', email: 'contacto@hp.com', phone: '3001234567', address: 'Calle 10 # 20-30', status: 'ACTIVE' },
    { id: 8, name: 'Care One',    nit: '901.777.111', email: 'info@careone.com', phone: '3007654321', address: 'Av. 68 # 12-05', status: 'ACTIVE' },
    { id: 9, name: 'Seguros XYZ', nit: '899.555.333', status: 'INACTIVE' } // sin dirección (opcional)
  ];

  private readonly _insurances$ = new BehaviorSubject<InsuranceI[]>([...this.INITIAL]);
  readonly insurances$ = this._insurances$.asObservable();

  list(params?: InsuranceListParams): Observable<InsuranceI[]> {
    return this.insurances$.pipe(
      delay(120),
      map(arr => this.applyFilters(arr, params))
    );
  }

  add(partial: Omit<InsuranceI, 'id'> & { id?: number }): Observable<InsuranceI> {
    const nextId = this.generateId();
    const newItem: InsuranceI = { ...partial, id: partial.id ?? nextId };
    this._insurances$.next([newItem, ...this._insurances$.value]);
    return of(newItem).pipe(delay(100));
  }

  update(id: number, patch: Partial<InsuranceI>): Observable<InsuranceI | undefined> {
    const arr = this._insurances$.value;
    const idx = arr.findIndex(i => i.id === id);
    if (idx === -1) return of(undefined).pipe(delay(80));

    const updated: InsuranceI = { ...arr[idx], ...patch }; // ← address se mergea aquí
    const copy = [...arr];
    copy[idx] = updated;
    this._insurances$.next(copy);
    return of(updated).pipe(delay(90));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._insurances$.value;
    const filtered = arr.filter(i => i.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._insurances$.next(filtered);
    return of(changed).pipe(delay(80));
  }

  getById(id: number): Observable<InsuranceI | undefined> {
    return this.insurances$.pipe(map(arr => arr.find(i => i.id === id)), delay(60));
  }

  // helpers
  private applyFilters(items: InsuranceI[], params?: InsuranceListParams): InsuranceI[] {
    let out = items;
    if (params?.status) out = out.filter(r => r.status === params.status);
    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const idStr = String(r.id ?? '');
        return (
          idStr.includes(q) ||
          (r.name ?? '').toLowerCase().includes(q) ||
          (r.nit ?? '').toLowerCase().includes(q) ||
          (r.email ?? '').toLowerCase().includes(q) ||
          (r.phone ?? '').toLowerCase().includes(q) ||
          (r.address ?? '').toLowerCase().includes(q) // ← address en el filtro global
        );
      });
    }
    return [...out].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }

  private generateId(): number {
    const ids = this._insurances$.value.map(i => i.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1;
    return max + 1;
  }
}
