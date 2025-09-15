import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ResultI, ResultState } from '../models/result-model';

export interface ResultListParams {
  q?: string;
  state?: ResultState;
  orderId?: number;
  sampleId?: number;
  examId?: number;
  parameterId?: number;
}

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly INITIAL: ResultI[] = [
    {
      id: 7001,
      orderId: 1001, sampleId: 20001, examId: 1, parameterId: 101,
      numValue: 92.3, outRange: false,
      dateResult: '2025-09-10T10:00:00Z',
      validatedForId: null, validatedFor: null,
      method: 'Enzimático (GOD/POD)',
      units: 'mg/dL',
      comment: null,
      resultState: 'VALIDADO',
    },
    {
      id: 7002,
      orderId: 1001, sampleId: 20001, examId: 1, parameterId: 102,
      textValue: 'Ayuno cumplido',
      outRange: null,
      dateResult: '2025-09-10T10:03:00Z',
      validatedForId: null, validatedFor: null,
      method: 'Enzimático (GOD/POD)',
      units: null,
      comment: null,
      resultState: 'PENDIENTE',
    }
  ];

  private readonly _items$ = new BehaviorSubject<ResultI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: ResultListParams): Observable<ResultI[]> {
    return this.items$.pipe(
      map(items => items || []),  // Aseguramos que no sea null
      map(items => this.applyFilters(items, params)),
      delay(80)
    );
  }

  getById(id: number): Observable<ResultI | undefined> {
    return this.items$.pipe(map(rows => rows.find(r => r.id === id)), delay(50));
  }

  upsertByParam(sampleId: number, parameterId: number, row: Omit<ResultI, 'id' | 'sampleId' | 'parameterId'>): Observable<ResultI> {
    const arr = this._items$.value;
    const idx = arr.findIndex(r => r.sampleId === sampleId && r.parameterId === parameterId);
    if (idx === -1) {
      const created = this.normalize({ ...row, id: this.generateId(), sampleId, parameterId });
      this._items$.next([created, ...arr]);
      return of(created).pipe(delay(60));
    }
    const updated = this.normalize({ ...arr[idx], ...row, sampleId, parameterId });
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(60));
  }

  add(row: Omit<ResultI, 'id'> & { id?: number }): Observable<ResultI> {
    const created = this.normalize({ ...row, id: row.id ?? this.generateId() });
    this._items$.next([created, ...this._items$.value]);
    return of(created).pipe(delay(60));
  }

  update(id: number, patch: Partial<ResultI>): Observable<ResultI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(r => r.id === id);
    if (idx === -1) return of(undefined).pipe(delay(40));
    const updated = this.normalize({ ...arr[idx], ...patch });
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(60));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const filtered = arr.filter(r => r.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._items$.next(filtered);
    return of(changed).pipe(delay(40));
  }

  // ===== Helpers =====
  private normalize(r: ResultI): ResultI {
    const fecha = r.dateResult ?? new Date().toISOString();
    let valor = r.numValue ?? null;
    if (typeof valor === 'number') {
      const f = Math.pow(10, 6);
      valor = Math.round(valor * f) / f; // NUMERIC(18,6)
    }
    return {
      ...r,
      dateResult: fecha,
      numValue: valor,
      resultState: r.resultState ?? 'CAPTURADO'
    };
  }

  private applyFilters(items: ResultI[], p?: ResultListParams): ResultI[] {
    let out = items;
    if (p?.orderId != null) out = out.filter(r => r.orderId === p.orderId);
    if (p?.sampleId != null) out = out.filter(r => r.sampleId === p.sampleId);
    if (p?.examId != null) out = out.filter(r => r.examId === p.examId);
    if (p?.parameterId != null) out = out.filter(r => r.parameterId === p.parameterId);
    if (p?.state) out = out.filter(r => r.resultState === p.state);

    const q = p?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const m = (r.method ?? '').toLowerCase();
        const u = (r.units ?? '').toLowerCase();
        const c = (r.comment ?? '').toLowerCase();
        const t = (r.textValue ?? '').toLowerCase();
        const n = r.numValue != null ? String(r.numValue) : '';
        return m.includes(q) || u.includes(q) || c.includes(q) || t.includes(q) || n.includes(q);
      });
    }

    return [...out].sort((a, b) =>
      (b.dateResult ?? '').localeCompare(a.dateResult ?? '') || (b.id ?? 0) - (a.id ?? 0)
    );
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 7000;
    return max + 1;
  }
}
