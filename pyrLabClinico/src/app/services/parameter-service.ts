// src/app/services/parameter-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { ParameterI, TypeValue } from '../models/parameter-model';

export interface ParamListParams {
  q?: string;
  examenId?: number;
  type?: TypeValue;
}

interface ParameterListResponse { parameters?: ParameterApi[]; }
interface ParameterApi extends ParameterI {}

@Injectable({ providedIn: 'root' })
export class ParameterService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<ParameterI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<ParameterI[]>;

  list(params?: ParamListParams, options?: { force?: boolean }): Observable<ParameterI[]> {
    return this.ensureLoaded(options?.force).pipe(
      map(list => this.applyFilters(list, params))
    );
  }

  refresh(): Observable<ParameterI[]> {
    return this.ensureLoaded(true);
  }

  listByExam(examenId: number, params?: ParamListParams): Observable<ParameterI[]> {
    return this.list({ ...(params ?? {}), examenId });
  }

  getById(id: number): Observable<ParameterI | undefined> {
    return this.http.get<ParameterApi>(`${this.baseUrl}/parametro/${id}/public`).pipe(
      map(api => this.mapFromApi(api)),
      tap(param => this.upsert(param)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  add(examenId: number, partial: Omit<ParameterI, 'id' | 'examenId'> & { id?: number }): Observable<ParameterI> {
    return this.http.post<ParameterApi>(`${this.baseUrl}/parametro/public`, this.mapToApi({ ...partial, examenId })).pipe(
      map(api => this.mapFromApi(api)),
      tap(param => this._items$.next([param, ...this._items$.value]))
    );
  }

  update(id: number, patch: Partial<ParameterI>): Observable<ParameterI | undefined> {
    return this.http.patch<ParameterApi>(`${this.baseUrl}/parametro/${id}/public`, this.mapToApi(patch)).pipe(
      map(api => this.mapFromApi(api)),
      tap(param => this.upsert(param)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/parametro/${id}/logic/public`, {}).pipe(
      map(() => true),
      tap(() => this._items$.next(this._items$.value.filter(p => p.id !== id))),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  private ensureLoaded(force = false): Observable<ParameterI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<ParameterListResponse>(`${this.baseUrl}/parametros/public`).pipe(
        map(res => (res.parameters ?? []).map(p => this.mapFromApi(p))),
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

  private upsert(parameter: ParameterI): void {
    if (!parameter.id) return;
    const copy = [...this._items$.value];
    const idx = copy.findIndex(p => p.id === parameter.id);
    if (idx === -1) {
      this._items$.next([parameter, ...copy]);
      return;
    }
    copy[idx] = parameter;
    this._items$.next(copy);
  }

  private mapFromApi(api: ParameterApi): ParameterI {
    return {
      ...api,
      examenId: api.examenId,
      typeValue: api.typeValue
    };
  }

  private mapToApi(payload: Partial<ParameterI>): Partial<ParameterApi> {
    return {
      ...payload
    };
  }

  private applyFilters(items: ParameterI[], params?: ParamListParams): ParameterI[] {
    let filtered = [...items];
    if (params?.examenId) filtered = filtered.filter(p => p.examenId === params.examenId);
    if (params?.type) filtered = filtered.filter(p => p.typeValue === params.type);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p => {
        const code = (p.code ?? '').toLowerCase();
        const name = (p.name ?? '').toLowerCase();
        const unit = (p.unit ?? '').toLowerCase();
        return code.includes(q) || name.includes(q) || unit.includes(q);
      });
    }

    return filtered.sort((a, b) =>
      (a.examenId ?? 0) - (b.examenId ?? 0) ||
      (a.visualOrder ?? 0) - (b.visualOrder ?? 0) ||
      (a.id ?? 0) - (b.id ?? 0)
    );
  }
}
