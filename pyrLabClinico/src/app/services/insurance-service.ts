import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { InsuranceI } from '../models/insurance-model';

export interface InsuranceListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface InsuranceListResponse { insurances?: InsuranceI[]; }

@Injectable({ providedIn: 'root' })
export class InsurancesService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<InsuranceI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<InsuranceI[]>;

  list(params?: InsuranceListParams, options?: { force?: boolean }): Observable<InsuranceI[]> {
    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() => this.items$.pipe(map(items => this.applyFilters(items, params))))
    );
  }

  refresh(): Observable<InsuranceI[]> {
    return this.ensureDataLoaded(true);
  }

  add(partial: Omit<InsuranceI, 'id'> & { id?: number }): Observable<InsuranceI> {
    return this.http.post<InsuranceI>(`${this.baseUrl}/seguro`, partial).pipe(
      tap(newItem => this._items$.next([newItem, ...this._items$.value]))
    );
  }

  update(id: number, patch: Partial<InsuranceI>): Observable<InsuranceI | undefined> {
    return this.http.patch<InsuranceI>(`${this.baseUrl}/seguro/${id}`, patch).pipe(
      tap(item => this.upsert(item)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/seguro/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => {
        const arr = [...this._items$.value];
        const idx = arr.findIndex(i => i.id === id);
        if (idx === -1) {
          this.refresh().subscribe();
          return;
        }
        arr[idx] = { ...arr[idx], status: 'INACTIVE' };
        this._items$.next(arr);
      }),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<InsuranceI | undefined> {
    return this.http.get<InsuranceI>(`${this.baseUrl}/seguro/${id}`).pipe(
      tap(item => this.upsert(item)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  private ensureDataLoaded(force = false): Observable<InsuranceI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<InsuranceListResponse>(`${this.baseUrl}/seguros`).pipe(
        map(res => res.insurances ?? []),
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

  private upsert(item: InsuranceI): void {
    if (!item?.id) return;
    const arr = [...this._items$.value];
    const idx = arr.findIndex(i => i.id === item.id);
    if (idx === -1) {
      this._items$.next([item, ...arr]);
      return;
    }
    arr[idx] = item;
    this._items$.next(arr);
  }

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
          (r.address ?? '').toLowerCase().includes(q)
        );
      });
    }
    return [...out].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }
}
