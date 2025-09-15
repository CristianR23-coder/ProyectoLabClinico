import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SampleI, SampleState } from '../models/sample-model';

export interface SampleListParams {
  q?: string;
  state?: SampleState;
  orderId?: number;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SamplesService {
  // Semilla: ajusta IDs de orden existentes (1001/1002) según tu OrdersService
  private readonly INITIAL: SampleI[] = [
    {
      id: 20001,
      orderId: 1001,
      type: 'SANGRE',
      barcode: 'BRC-1001-01',
      drawDate: '2025-09-10T09:20:00Z',
      state: 'RECOLECTADA',
      observations: 'Ayuno 8h'
    },
    {
      id: 20002,
      orderId: 1001,
      type: 'SUERO',
      barcode: 'BRC-1001-02',
      drawDate: '2025-09-10T09:25:00Z',
      state: 'ALMACENADA'
    },
    {
      id: 20003,
      orderId: 1002,
      type: 'ORINA',
      barcode: 'BRC-1002-01',
      drawDate: '2025-09-10T16:00:00Z',
      state: 'EN_PROCESO'
    }
  ];

  private readonly _items$ = new BehaviorSubject<SampleI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: SampleListParams): Observable<SampleI[]> {
    return this.items$.pipe(delay(120), map(items => this.applyFilters(items, params)));
  }

  add(partial: Omit<SampleI, 'id'> & { id?: number }): Observable<SampleI> {
    const nextId = this.generateId();
    const s: SampleI = { ...partial, id: partial.id ?? nextId };
    this._items$.next([s, ...this._items$.value]);
    return of(s).pipe(delay(80));
  }

  update(id: number, patch: Partial<SampleI>): Observable<SampleI | undefined> {
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

  getById(id: number): Observable<SampleI | undefined> {
    return this.items$.pipe(map(list => list.find(x => x.id === id)), delay(50));
  }

  // Helpers
  private applyFilters(items: SampleI[], params?: SampleListParams): SampleI[] {
    let out = items;

    if (params?.state) out = out.filter(r => r.state === params.state);
    if (params?.orderId != null) out = out.filter(r => r.orderId === params.orderId);
    if (params?.type) out = out.filter(r => r.type?.toLowerCase() === params.type!.toLowerCase());

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const oid = String(r.orderId);
        const tipo = r.type?.toLowerCase() ?? '';
        const cb = r.barcode?.toLowerCase() ?? '';
        const est = r.state?.toLowerCase() ?? '';
        return oid.includes(q) || tipo.includes(q) || cb.includes(q) || est.includes(q);
      });
    }

    return [...out].sort((a, b) => (b.drawDate ?? '').localeCompare(a.drawDate ?? ''));
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 20000;
    return max + 1;
  }
}
