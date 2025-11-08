// src/app/services/doctors.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DoctorI } from '../models/doctor-model';

export interface DoctorListParams { q?: string; status?: 'ACTIVE' | 'INACTIVE'; }
interface DoctorListResponse { doctors?: DoctorApi[]; }
type DoctorApi = Omit<DoctorI, 'userId'> & { user_id?: number | null };

@Injectable({ providedIn: 'root' })
export class DoctorsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<DoctorI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<DoctorI[]>;

  list(params?: DoctorListParams, options?: { force?: boolean }): Observable<DoctorI[]> {
    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() =>
        this.items$.pipe(map(items => this.applyFilters(items, params)))
      )
    );
  }

  refresh(): Observable<DoctorI[]> {
    return this.ensureDataLoaded(true);
  }

  add(partial: Omit<DoctorI, 'id' | 'userId'> & { id?: number }): Observable<DoctorI> {
    return this.http.post<DoctorApi>(`${this.baseUrl}/doctor`, this.mapToApi(partial)).pipe(
      map(api => this.mapFromApi(api)),
      tap(doc => this._items$.next([doc, ...this._items$.value]))
    );
  }

  update(id: number, patch: Partial<DoctorI>): Observable<DoctorI | undefined> {
    return this.http.patch<DoctorApi>(`${this.baseUrl}/doctor/${id}`, this.mapToApi(patch)).pipe(
      map(api => this.mapFromApi(api)),
      tap(doc => this.upsert(doc)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/doctor/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => {
        const items = [...this._items$.value];
        const idx = items.findIndex(d => d.id === id);
        if (idx === -1) {
          this.refresh().subscribe();
          return;
        }
        items[idx] = { ...items[idx], status: 'INACTIVE' };
        this._items$.next(items);
      }),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<DoctorI | undefined> {
    return this.http.get<DoctorApi>(`${this.baseUrl}/doctor/${id}`).pipe(
      map(api => this.mapFromApi(api)),
      tap(doc => this.upsert(doc)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  getByUserId(userId: number): Observable<DoctorI | undefined> {
    return this.ensureDataLoaded().pipe(
      switchMap(() =>
        this.items$.pipe(map(list => list.find(x => x.userId === userId)))
      )
    );
  }

  private ensureDataLoaded(force = false): Observable<DoctorI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<DoctorListResponse>(`${this.baseUrl}/doctores`).pipe(
        map(res => (res?.doctors ?? []).map(doc => this.mapFromApi(doc))),
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

  private upsert(doc: DoctorI): void {
    if (!doc.id) return;
    const copy = [...this._items$.value];
    const idx = copy.findIndex(d => d.id === doc.id);
    if (idx === -1) {
      this._items$.next([doc, ...copy]);
      return;
    }
    copy[idx] = doc;
    this._items$.next(copy);
  }

  private applyFilters(items: DoctorI[], params?: DoctorListParams): DoctorI[] {
    let filtered = [...items];

    if (params?.status) {
      filtered = filtered.filter(item => item.status === params.status);
    }

    const term = params?.q?.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(item => {
        const haystack = [
          item.name ?? '',
          item.docNumber ?? '',
          item.specialty ?? '',
          item.email ?? '',
          item.phone ?? ''
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      });
    }

    return filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }

  private mapFromApi(api: DoctorApi): DoctorI {
    const { user_id, ...rest } = api;
    return {
      ...rest,
      userId: typeof user_id === 'number' ? user_id : undefined
    };
  }

  private mapToApi(payload: Partial<DoctorI>): Partial<DoctorApi> {
    const { userId, ...rest } = payload;
    const body: Partial<DoctorApi> = { ...rest };
    if (typeof userId !== 'undefined') {
      body.user_id = userId;
    }
    return body;
  }
}
