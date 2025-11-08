// src/app/services/exams.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { ExamI, SpecimenType } from '../models/exam-model';

export interface ExamListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  specimenType?: SpecimenType;
}

interface ExamListResponse { exams?: ExamI[]; }

@Injectable({ providedIn: 'root' })
export class ExamsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<ExamI[]>([]);
  readonly items$ = this._items$.asObservable();
  readonly exams$ = this.ensureDataLoaded().pipe(
    switchMap(() => this.items$)
  );

  private loaded = false;
  private loading$?: Observable<ExamI[]>;

  list(params?: ExamListParams, options?: { force?: boolean }): Observable<ExamI[]> {
    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() => this.items$.pipe(map(items => this.applyFilters(items, params))))
    );
  }

  refresh(): Observable<ExamI[]> {
    return this.ensureDataLoaded(true);
  }

  add(partial: Omit<ExamI, 'id'> & { id?: number }): Observable<ExamI> {
    return this.http.post<ExamI>(`${this.baseUrl}/examen`, partial).pipe(
      tap(newExam => this._items$.next([newExam, ...this._items$.value]))
    );
  }

  update(id: number, patch: Partial<ExamI>): Observable<ExamI | undefined> {
    return this.http.patch<ExamI>(`${this.baseUrl}/examen/${id}`, patch).pipe(
      tap(exam => this.upsert(exam)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/examen/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => {
        const arr = [...this._items$.value];
        const idx = arr.findIndex(e => e.id === id);
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

  getById(id: number): Observable<ExamI | undefined> {
    return this.http.get<ExamI>(`${this.baseUrl}/examen/${id}`).pipe(
      tap(exam => this.upsert(exam)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  setStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<ExamI | undefined> {
    return this.update(id, { status });
  }

  toggleStatus(id: number): Observable<ExamI | undefined> {
    const current = this._items$.value.find(e => e.id === id);
    if (!current) {
      return this.getById(id).pipe(
        switchMap(ex => ex ? this.setStatus(ex.id!, ex.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE') : of(undefined))
      );
    }
    const next = current.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.setStatus(id, next);
  }

  private ensureDataLoaded(force = false): Observable<ExamI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.http.get<ExamListResponse>(`${this.baseUrl}/examenes`).pipe(
        map(res => res.exams ?? []),
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

  private upsert(exam: ExamI): void {
    if (!exam?.id) return;
    const copy = [...this._items$.value];
    const idx = copy.findIndex(e => e.id === exam.id);
    if (idx === -1) {
      this._items$.next([exam, ...copy]);
      return;
    }
    copy[idx] = exam;
    this._items$.next(copy);
  }

  private applyFilters(items: ExamI[], params?: ExamListParams): ExamI[] {
    let out = items;

    if (params?.status) out = out.filter(r => r.status === params.status);
    if (params?.specimenType) out = out.filter(r => r.specimenType === params.specimenType);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const code = r.code?.toLowerCase() ?? '';
        const name = r.name?.toLowerCase() ?? '';
        const method = r.method?.toLowerCase() ?? '';
        const specimen = r.specimenType?.toLowerCase() ?? '';
        return (
          code.includes(q) ||
          name.includes(q) ||
          method.includes(q) ||
          specimen.includes(q)
        );
      });
    }

    return [...out].sort((a, b) => {
      const nameCmp = (a.name ?? '').localeCompare(b.name ?? '');
      if (nameCmp !== 0) return nameCmp;
      return (a.code ?? '').localeCompare(b.code ?? '');
    });
  }
}
