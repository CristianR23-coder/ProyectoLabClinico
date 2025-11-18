import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { ResultI, ResultState } from '../models/result-model';

export interface ResultFilterParams {
  q?: string;
  state?: ResultState;
  orderId?: number;
  sampleId?: number;
  examId?: number;
  parameterId?: number;
}

export interface ResultListParams extends ResultFilterParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ResultListResponse {
  results?: ResultApi[];
}

type ResultApi = {
  id?: number;
  orderId: number;
  sampleId: number;
  examId: number;
  parameterId: number;
  numValue?: number | string | null;
  textValue?: string | null;
  outRange?: boolean | null;
  dateResult?: string | Date | null;
  validatedForId?: number | null;
  validatedFor?: string | null;
  method?: string | null;
  units?: string | null;
  comment?: string | null;
  resultState?: ResultState | null;
  status?: 'ACTIVE' | 'INACTIVE';
};

@Injectable({ providedIn: 'root' })
export class ResultsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<ResultI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<ResultI[]>;

  constructor() {
    this.ensureDataLoaded().subscribe({
      error: err => console.error('[ResultsService] initial load failed', err)
    });
  }

  list(params?: ResultListParams, options?: { force?: boolean }): Observable<PaginatedResult<ResultI>> {
    const page = this.normalizePage(params?.page);
    const pageSize = this.normalizePageSize(params?.pageSize);

    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() =>
        this.items$.pipe(
          map(items => this.applyFilters(items, params)),
          map(filtered => this.paginate(filtered, page, pageSize))
        )
      )
    );
  }

  refresh(): Observable<ResultI[]> {
    return this.ensureDataLoaded(true);
  }

  getById(id: number): Observable<ResultI | undefined> {
    if (!id) return of(undefined);

    return this.http.get<ResultApi>(`${this.baseUrl}/resultado/${id}`).pipe(
      map(api => (api ? this.mapFromApi(api) : undefined)),
      tap(result => { if (result) this.upsert(result); }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  add(row: Omit<ResultI, 'id'> & { id?: number }): Observable<ResultI> {
    const payload: ResultApi = {
      ...this.mapToApi(row),
      resultState: row.resultState ?? 'PENDIENTE',
      status: 'ACTIVE'
    } as ResultApi;

    return this.http.post<ResultApi>(`${this.baseUrl}/resultado`, payload).pipe(
      map(api => this.mapFromApi(api)),
      tap(result => this.upsert(result))
    );
  }

  update(id: number, patch: Partial<ResultI>): Observable<ResultI | undefined> {
    if (!id) return throwError(() => new Error('ID requerido para actualizar'));

    if (!patch || Object.keys(patch).length === 0) {
      return of(this._items$.value.find(r => r.id === id));
    }

    const current = this._items$.value.find(r => r.id === id);
    const source = current ? { ...current, ...patch } : patch;
    const payload = this.mapToApi(source);

    return this.http.patch<ResultApi>(`${this.baseUrl}/resultado/${id}`, payload).pipe(
      map(api => this.mapFromApi(api)),
      tap(result => this.upsert(result)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    if (!id) return of(false);

    return this.http.patch(`${this.baseUrl}/resultado/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => this.removeFromCache(id)),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  upsertByParam(
    sampleId: number,
    parameterId: number,
    row: Omit<ResultI, 'id' | 'sampleId' | 'parameterId'>
  ): Observable<ResultI> {
    const existing = this._items$.value.find(r => r.sampleId === sampleId && r.parameterId === parameterId);
    if (existing?.id) {
      return this.update(existing.id, { ...row, sampleId, parameterId }).pipe(
        map(updated => {
          if (!updated) throw new Error('No se pudo actualizar el resultado existente');
          return updated;
        })
      );
    }
    return this.add({ ...row, sampleId, parameterId });
  }

  private ensureDataLoaded(force = false): Observable<ResultI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<ResultListResponse>(`${this.baseUrl}/resultados`).pipe(
        map(res => (res?.results ?? []).map(item => this.mapFromApi(item))),
        tap(list => {
          this._items$.next(list);
          this.loaded = true;
        }),
        finalize(() => { this.loading$ = undefined; }),
        shareReplay(1)
      );
    }

    return this.loading$;
  }

  private mapFromApi(api: ResultApi): ResultI {
    return this.normalize({
      id: api.id,
      orderId: api.orderId,
      sampleId: api.sampleId,
      examId: api.examId,
      parameterId: api.parameterId,
      numValue: this.asNumber(api.numValue),
      textValue: api.textValue ?? null,
      outRange: typeof api.outRange === 'boolean' ? api.outRange : null,
      dateResult: this.asIsoString(api.dateResult),
      validatedForId: api.validatedForId ?? null,
      validatedFor: api.validatedFor ?? null,
      method: api.method ?? null,
      units: api.units ?? null,
      comment: api.comment ?? null,
      resultState: api.resultState ?? 'PENDIENTE'
    });
  }

  private mapToApi(payload: Partial<ResultI>): Partial<ResultApi> {
    const body: Partial<ResultApi> = {};

    if (payload.orderId != null) body.orderId = payload.orderId;
    if (payload.sampleId != null) body.sampleId = payload.sampleId;
    if (payload.examId != null) body.examId = payload.examId;
    if (payload.parameterId != null) body.parameterId = payload.parameterId;

    if (payload.numValue !== undefined) body.numValue = payload.numValue;
    if (payload.textValue !== undefined) body.textValue = payload.textValue ?? null;
    if (payload.outRange !== undefined) body.outRange = payload.outRange;
    if (payload.dateResult !== undefined) body.dateResult = payload.dateResult ?? null;
    if (payload.validatedForId !== undefined) body.validatedForId = payload.validatedForId ?? null;
    if (payload.validatedFor !== undefined) body.validatedFor = payload.validatedFor ?? null;
    if (payload.method !== undefined) body.method = payload.method ?? null;
    if (payload.units !== undefined) body.units = payload.units ?? null;
    if (payload.comment !== undefined) body.comment = payload.comment ?? null;
    if (payload.resultState !== undefined) body.resultState = payload.resultState;

    return body;
  }

  private asNumber(value: number | string | null | undefined): number | null | undefined {
    if (value === null || value === undefined) return value;
    const parsed = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private asIsoString(value: string | Date | null | undefined): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toISOString();
    }
    return value.toISOString();
  }

  private normalize(r: ResultI): ResultI {
    const dateResult = r.dateResult ?? new Date().toISOString();
    let numValue = r.numValue ?? null;
    if (typeof numValue === 'number') {
      const factor = Math.pow(10, 6);
      numValue = Math.round(numValue * factor) / factor;
    }
    return {
      ...r,
      dateResult,
      numValue,
      resultState: r.resultState ?? 'PENDIENTE'
    };
  }

  private paginate(items: ResultI[], page: number, pageSize: number): PaginatedResult<ResultI> {
    const safePageSize = Math.max(pageSize, 1);
    const total = items.length;
    const totalPages = Math.max(Math.ceil(total / safePageSize), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * safePageSize;
    return {
      items: items.slice(start, start + safePageSize),
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages
    };
  }

  private normalizePage(page?: number): number {
    if (typeof page !== 'number') return 1;
    const parsed = Math.floor(page);
    return parsed > 0 ? parsed : 1;
  }

  private normalizePageSize(size?: number): number {
    if (typeof size !== 'number') return 10;
    const parsed = Math.floor(size);
    const min = parsed > 0 ? parsed : 10;
    return Math.min(min, 50);
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

  private upsert(row: ResultI): void {
    const copy = [...this._items$.value];
    if (!row.id) {
      this._items$.next([row, ...copy]);
      return;
    }
    const idx = copy.findIndex(r => r.id === row.id);
    if (idx === -1) {
      this._items$.next([row, ...copy]);
      return;
    }
    copy[idx] = row;
    this._items$.next(copy);
  }

  private removeFromCache(id: number): void {
    const filtered = this._items$.value.filter(r => r.id !== id);
    this._items$.next(filtered);
  }
}
