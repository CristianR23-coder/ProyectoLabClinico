import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { SampleI, SampleState } from '../models/sample-model';
import { SpecimenType } from '../models/exam-model';

export interface SampleFilterParams {
  q?: string;
  state?: SampleState;
  orderId?: number;
  type?: SpecimenType | string;
}

export interface SampleListParams extends SampleFilterParams {
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

interface SampleListResponse {
  samples?: SampleApi[];
}

type SampleApi = {
  id?: number;
  orderId: number;
  type: SpecimenType | string;
  barcode?: string | null;
  drawDate?: string | Date | null;
  state: SampleState;
  observations?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
};

@Injectable({ providedIn: 'root' })
export class SamplesService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<SampleI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<SampleI[]>;

  constructor() {
    this.ensureDataLoaded().subscribe({
      error: err => console.error('[SamplesService] initial load failed', err)
    });
  }

  list(params?: SampleListParams, options?: { force?: boolean }): Observable<PaginatedResult<SampleI>> {
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

  listAll(params?: SampleFilterParams, options?: { force?: boolean }): Observable<SampleI[]> {
    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() =>
        this.items$.pipe(map(items => this.applyFilters(items, params)))
      )
    );
  }

  refresh(): Observable<SampleI[]> {
    return this.ensureDataLoaded(true);
  }

  getById(id: number): Observable<SampleI | undefined> {
    if (!id) return of(undefined);

    return this.http.get<SampleApi>(`${this.baseUrl}/muestra/${id}`).pipe(
      map(api => (api ? this.mapFromApi(api) : undefined)),
      tap(sample => { if (sample) this.upsert(sample); }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  add(partial: Omit<SampleI, 'id'> & { id?: number }): Observable<SampleI> {
    const payload: SampleApi = {
      ...this.mapToApi(partial),
      status: 'ACTIVE'
    } as SampleApi;

    return this.http.post<SampleApi>(`${this.baseUrl}/muestra`, payload).pipe(
      map(api => this.mapFromApi(api)),
      tap(sample => this.upsert(sample))
    );
  }

  update(id: number, patch: Partial<SampleI>): Observable<SampleI | undefined> {
    if (!id) return throwError(() => new Error('ID requerido para actualizar'));

    if (!patch || Object.keys(patch).length === 0) {
      return of(this._items$.value.find(s => s.id === id));
    }

    const current = this._items$.value.find(s => s.id === id);
    const source = current ? { ...current, ...patch } : patch;
    const payload = this.mapToApi(source);

    return this.http.patch<SampleApi>(`${this.baseUrl}/muestra/${id}`, payload).pipe(
      map(api => this.mapFromApi(api)),
      tap(sample => this.upsert(sample)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    if (!id) return of(false);

    return this.http.patch(`${this.baseUrl}/muestra/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => this.removeFromCache(id)),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  private ensureDataLoaded(force = false): Observable<SampleI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<SampleListResponse>(`${this.baseUrl}/muestras`).pipe(
        map(res => (res?.samples ?? []).map(item => this.mapFromApi(item))),
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

  private mapFromApi(api: SampleApi): SampleI {
    return this.normalize({
      id: api.id,
      orderId: api.orderId,
      type: this.normalizeType(api.type),
      barcode: api.barcode ?? undefined,
      drawDate: this.asIsoString(api.drawDate),
      state: api.state,
      observations: api.observations ?? undefined,
      status: api.status ?? 'ACTIVE'
    });
  }

  private mapToApi(payload: Partial<SampleI>): Partial<SampleApi> {
    const body: Partial<SampleApi> = {};
    if (payload.orderId != null) body.orderId = payload.orderId;
    if (payload.type != null) body.type = payload.type;
    if (payload.barcode !== undefined) body.barcode = payload.barcode ?? null;
    if (payload.drawDate !== undefined) body.drawDate = payload.drawDate ?? null;
    if (payload.state !== undefined) body.state = payload.state;
    if (payload.observations !== undefined) body.observations = payload.observations ?? null;
    if (payload.status !== undefined) body.status = payload.status;
    return body;
  }

  private asIsoString(value: string | Date | null | undefined): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toISOString();
    }
    return value.toISOString();
  }

  private normalize(sample: SampleI): SampleI {
    return {
      ...sample,
      type: this.normalizeType(sample.type),
      drawDate: sample.drawDate ?? undefined,
      status: sample.status ?? 'ACTIVE'
    };
  }

  private normalizeType(value?: SpecimenType | string | null): SpecimenType {
    if (!value) return 'OTRA';
    const upper = value.toString().toUpperCase();
    const allowed: SpecimenType[] = ['SANGRE','SUERO','PLASMA','ORINA','SALIVA','HECES','TEJIDO','OTRA'];
    return (allowed.includes(upper as SpecimenType) ? upper : 'OTRA') as SpecimenType;
  }

  private applyFilters(items: SampleI[], params?: SampleFilterParams): SampleI[] {
    let out = items;

    if (params?.state) out = out.filter(s => s.state === params.state);
    if (params?.orderId != null) out = out.filter(s => s.orderId === params.orderId);
    if (params?.type) {
      const type = this.normalizeType(params.type).toLowerCase();
      out = out.filter(s => this.normalizeType(s.type).toLowerCase() === type);
    }

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(s => {
        const orderStr = String(s.orderId ?? '');
        const bc = (s.barcode ?? '').toLowerCase();
        const type = this.normalizeType(s.type).toLowerCase();
        const state = (s.state ?? '').toLowerCase();
        const obs = (s.observations ?? '').toLowerCase();
        return orderStr.includes(q) || bc.includes(q) || type.includes(q) || state.includes(q) || obs.includes(q);
      });
    }

    return [...out].sort((a, b) =>
      (b.drawDate ?? '').localeCompare(a.drawDate ?? '') || (b.id ?? 0) - (a.id ?? 0)
    );
  }

  private paginate(items: SampleI[], page: number, pageSize: number): PaginatedResult<SampleI> {
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

  private upsert(sample: SampleI): void {
    const copy = [...this._items$.value];
    if (!sample.id) {
      this._items$.next([sample, ...copy]);
      return;
    }
    const idx = copy.findIndex(s => s.id === sample.id);
    if (idx === -1) {
      this._items$.next([sample, ...copy]);
      return;
    }
    copy[idx] = sample;
    this._items$.next(copy);
  }

  private removeFromCache(id: number): void {
    const filtered = this._items$.value.filter(s => s.id !== id);
    this._items$.next(filtered);
  }
}
