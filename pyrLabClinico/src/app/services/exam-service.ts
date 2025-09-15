// src/app/exams/service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ExamI, SpecimenType } from '../models/exam-model';

export interface ExamListParams {
  q?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  specimenType?: SpecimenType;
}

@Injectable({ providedIn: 'root' })
export class ExamsService {
  // Datos iniciales (mock). Ajusta o reemplaza por lo que necesites.
  private readonly INITIAL: ExamI[] = [
    {
      id: 1,
      code: 'GLU',
      name: 'Glucosa',
      method: 'Enzimático (GOD/POD)',
      specimenType: 'SUERO',
      processingTimeMin: 30,
      status: 'ACTIVE',
      priceBase: 15000
    },
    {
      id: 2,
      code: 'COL',
      name: 'Colesterol Total',
      method: 'Enzimático',
      specimenType: 'SUERO',
      processingTimeMin: 35,
      status: 'ACTIVE',
      priceBase: 30000
    },
    {
      id: 3,
      code: 'HB',
      name: 'Hemoglobina',
      method: 'Cianometahemoglobina',
      specimenType: 'SANGRE',
      processingTimeMin: 20,
      status: 'ACTIVE',
      priceBase: 18000
    },
    {
      id: 4,
      code: 'PCR',
      name: 'Proteína C Reactiva',
      method: 'Turbidimetría',
      specimenType: 'SUERO',
      processingTimeMin: 45,
      status: 'INACTIVE',
      priceBase: 38000
    },
    {
      id: 5,
      code: 'URO',
      name: 'Uroanálisis (Tira Reactiva)',
      method: 'Colorimétrico',
      specimenType: 'ORINA',
      processingTimeMin: 15,
      status: 'ACTIVE',
      priceBase: 12000
    }
  ];

  private readonly _exams$ = new BehaviorSubject<ExamI[]>([...this.INITIAL]);
  readonly exams$: Observable<ExamI[]> = this._exams$.asObservable();

  list(params?: ExamListParams): Observable<ExamI[]> {
    return this.exams$.pipe(
      delay(200),
      map(items => this.applyFilters(items, params))
    );
  }

  add(partial: Omit<ExamI, 'id'> & { id?: number }): Observable<ExamI> {
    const nextId = this.generateId();
    const newExam: ExamI = { ...partial, id: partial.id ?? nextId };
    this._exams$.next([newExam, ...this._exams$.value]);
    return of(newExam).pipe(delay(120));
  }

  update(id: number, patch: Partial<ExamI>): Observable<ExamI | undefined> {
    const arr = this._exams$.value;
    const idx = arr.findIndex(e => e.id === id);

    console.log('[ExamsService.update] id=', id, 'foundIndex=', idx, 'patch=', patch);

    if (idx === -1) {
      return of(undefined).pipe(delay(80));
    }

    const updated: ExamI = { ...arr[idx], ...patch };
    const copy = [...arr];
    copy[idx] = updated;

    this._exams$.next(copy);
    return of(updated).pipe(delay(100));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._exams$.value;
    const filtered = arr.filter(e => e.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._exams$.next(filtered);
    return of(changed).pipe(delay(80));
  }

  getById(id: number): Observable<ExamI | undefined> {
    return this.exams$.pipe(
      map(arr => arr.find(e => e.id === id)),
      delay(50)
    );
  }

  // Helpers
  private applyFilters(items: ExamI[], params?: ExamListParams): ExamI[] {
    let out = items;

    if (params?.status) {
      out = out.filter(r => r.status === params.status);
    }
    if (params?.specimenType) {
      out = out.filter(r => r.specimenType === params.specimenType);
    }

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

    // Orden por nombre y luego por código
    return [...out].sort((a, b) => {
      const n = (a.name ?? '').localeCompare(b.name ?? '');
      if (n !== 0) return n;
      return (a.code ?? '').localeCompare(b.code ?? '');
    });
  }

  private generateId(): number {
    const ids = this._exams$.value.map(e => e.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 0;
    return max + 1;
  }

  // Conveniencias
  setStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Observable<ExamI | undefined> {
    return this.update(id, { status });
  }

  toggleStatus(id: number): Observable<ExamI | undefined> {
    const e = this._exams$.value.find(x => x.id === id);
    if (!e) return of(undefined).pipe(delay(0));
    const next: 'ACTIVE' | 'INACTIVE' = e.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.update(id, { status: next });
  }
}
