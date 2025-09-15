// src/app/parameters/service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ParameterI, TypeValue } from '../models/parameter-model';

export interface ParamListParams {
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class ParameterService {
  // Mock inicial (dos exámenes: 1 y 2)
  private readonly INITIAL: ParameterI[] = [
    { id: 101, examenId: 1, code: 'GLU', name: 'Glucosa', unit: 'mg/dL', refMin: 70, refMax: 100, typeValue: 'NUMERICO', decimals: 1, visualOrder: 1 },
    { id: 102, examenId: 1, code: 'GLU-ALT', name: 'Comentario', unit: null, typeValue: 'TEXTO', decimals: null, visualOrder: 2 },
    { id: 201, examenId: 2, code: 'COL', name: 'Colesterol', unit: 'mg/dL', refMin: 0, refMax: 200, typeValue: 'NUMERICO', decimals: 0, visualOrder: 1 },
  ];

  private readonly _items$ = new BehaviorSubject<ParameterI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  // ✅ NUEVO: lista TODOS los parámetros (sin filtrar por examen)
  list(params?: ParamListParams): Observable<ParameterI[]> {
    return this.items$.pipe(
      map(items => this.applyFilters(items, params)),
      map(items => [...items].sort((a, b) =>
        (a.examenId ?? 0) - (b.examenId ?? 0) ||
        (a.visualOrder ?? 0) - (b.visualOrder ?? 0) ||
        (a.id ?? 0) - (b.id ?? 0)
      )),
      delay(80)
    );
  }

  listByExam(examenId: number, params?: ParamListParams): Observable<ParameterI[]> {
    return this.items$.pipe(
      map(items => items.filter(p => p.examenId === examenId)),
      map(items => this.applyFilters(items, params)),
      map(items => [...items].sort((a, b) =>
        (a.visualOrder ?? 0) - (b.visualOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0)
      )),
      delay(120)
    );
  }

  getById(id: number): Observable<ParameterI | undefined> {
    return this.items$.pipe(map(arr => arr.find(p => p.id === id)), delay(50));
  }

  add(examenId: number, partial: Omit<ParameterI, 'id' | 'examenId'> & { id?: number }): Observable<ParameterI> {
    const nextId = this.generateId();
    const row: ParameterI = { ...partial, id: partial.id ?? nextId, examenId };
    this._items$.next([row, ...this._items$.value]);
    return of(row).pipe(delay(100));
  }

  update(id: number, patch: Partial<ParameterI>): Observable<ParameterI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return of(undefined).pipe(delay(60));
    const updated = { ...arr[idx], ...patch };
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(100));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const filtered = arr.filter(x => x.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._items$.next(filtered);
    return of(changed).pipe(delay(80));
  }

  // helpers
  private applyFilters(items: ParameterI[], params?: ParamListParams): ParameterI[] {
    const q = params?.q?.trim().toLowerCase();
    if (!q) return items;
    return items.filter(p => {
      const code = (p.code ?? '').toLowerCase();
      const name = (p.name ?? '').toLowerCase();
      const unit = (p.unit ?? '').toLowerCase();
      return code.includes(q) || name.includes(q) || unit.includes(q);
    });
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 100;
    return max + 1;
  }
}
