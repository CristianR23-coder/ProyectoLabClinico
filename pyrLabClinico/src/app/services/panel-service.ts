// services/panel-service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PanelI, PanelItemI, PanelState } from '../models/panel-model';

export interface PanelListParams {
  q?: string;
  state?: PanelState;
}

@Injectable({ providedIn: 'root' })
export class PanelsService {
  private readonly INITIAL: PanelI[] = [
    {
      id: 9001,
      name: 'Perfil lipídico',
      description: 'Colesterol total, HDL, LDL, Triglicéridos.',
      state: 'ACTIVO',
      items: [
        { kind: 'EXAM', examId: 301, required: true, order: 1 },
        { kind: 'EXAM', examId: 302, required: true, order: 2 },
        { kind: 'EXAM', examId: 303, required: true, order: 3 },
        { kind: 'EXAM', examId: 304, required: false, order: 4 },
      ],
      createdAt: '2025-09-01T10:00:00Z',
      updatedAt: '2025-09-10T10:00:00Z'
    },
    {
      id: 9002,
      name: 'Panel hepático',
      description: 'AST, ALT, FA, Bilirrubinas.',
      state: 'INACTIVO',
      items: [
        { kind: 'EXAM', examId: 401, required: true, order: 1 },
        { kind: 'EXAM', examId: 402, required: true, order: 2 },
        { kind: 'EXAM', examId: 403, required: false, order: 3 },
        { kind: 'EXAM', examId: 404, required: false, order: 4 },
      ],
      createdAt: '2025-09-05T12:00:00Z',
      updatedAt: '2025-09-05T12:00:00Z'
    }
  ];

  private readonly _items$ = new BehaviorSubject<PanelI[]>([...this.INITIAL]);
  readonly items$ = this._items$.asObservable();

  list(params?: PanelListParams): Observable<PanelI[]> {
    return this.items$.pipe(
      map(arr => this.applyFilters(arr, params)),
      delay(60)
    );
  }

  getById(id: number): Observable<PanelI | undefined> {
    return this.items$.pipe(map(arr => arr.find(p => p.id === id)), delay(40));
  }

  add(row: Omit<PanelI, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Observable<PanelI> {
    const created: PanelI = {
      ...row,
      id: row.id ?? this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: this.normalizeItems(row.items)
    };
    this._items$.next([created, ...this._items$.value]);
    return of(created).pipe(delay(60));
  }

  update(id: number, patch: Partial<PanelI>): Observable<PanelI | undefined> {
    const arr = this._items$.value;
    const idx = arr.findIndex(p => p.id === id);
    if (idx === -1) return of(undefined).pipe(delay(40));
    const updated: PanelI = {
      ...arr[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
      items: patch.items ? this.normalizeItems(patch.items) : arr[idx].items
    };
    const copy = [...arr]; copy[idx] = updated;
    this._items$.next(copy);
    return of(updated).pipe(delay(60));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._items$.value;
    const filtered = arr.filter(p => p.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._items$.next(filtered);
    return of(changed).pipe(delay(40));
  }

  // Helpers
  private normalizeItems(items: PanelItemI[]): PanelItemI[] {
    // Asegura order incremental si viene vacío y limpia ids inválidos según kind
    const out = (items ?? []).map((it, i) => {
      const base: PanelItemI = { ...it };
      if (base.kind === 'EXAM') { base.parameterId = null; }
      if (base.kind === 'PARAM') { base.examId = null; }
      base.required = base.required ?? false;
      base.order = base.order ?? i + 1;
      return base;
    });
    // ordena por 'order'
    return out.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  private applyFilters(items: PanelI[], p?: PanelListParams): PanelI[] {
    let out = items;
    if (p?.state) out = out.filter(x => x.state === p.state);
    const q = p?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(x =>
        x.name.toLowerCase().includes(q) ||
        (x.description ?? '').toLowerCase().includes(q)
      );
    }
    return [...out].sort((a, b) =>
      (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '') || (b.id ?? 0) - (a.id ?? 0)
    );
  }

  private generateId(): number {
    const ids = this._items$.value.map(x => x.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 9000;
    return max + 1;
  }
}
