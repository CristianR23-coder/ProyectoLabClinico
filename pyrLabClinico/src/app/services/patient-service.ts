// src/app/services/patient-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { PatientI } from '../models/patient-model';
import { InsuranceI } from '../models/insurance-model';
import { InsurancesService } from './insurance-service';

export interface PatientListParams { q?: string; status?: 'ACTIVE'|'INACTIVE'; }

interface PatientListResponse { patients?: PatientApi[]; }
interface PatientApi extends Omit<PatientI, 'insurance'> {
  insuranceId?: number | null;
  insurance?: InsuranceI | null;
}

interface PatientInsuranceListResponse { patientInsurances?: PatientInsuranceApi[]; }
interface PatientInsuranceApi {
  patientId: number;
  insuranceId: number;
  status: 'ACTIVE' | 'INACTIVE';
  startDate?: string;
  endDate?: string | null;
}

interface InsuranceListResponse { insurances?: InsuranceI[]; }

@Injectable({ providedIn: 'root' })
export class PatientsService {
  private http = inject(HttpClient);
  private insurancesSvc = inject(InsurancesService);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _items$ = new BehaviorSubject<PatientI[]>([]);
  readonly items$ = this._items$.asObservable();

  private loaded = false;
  private loading$?: Observable<PatientI[]>;

  list(params?: PatientListParams, options?: { force?: boolean }): Observable<PatientI[]> {
    return this.ensureLoaded(options?.force).pipe(
      switchMap(() => this.items$.pipe(map(items => this.applyFilters(items, params))))
    );
  }

  refresh(): Observable<PatientI[]> {
    return this.ensureLoaded(true);
  }

  add(partial: Omit<PatientI,'id'> & { id?: number }): Observable<PatientI> {
    return this.http.post<PatientApi>(`${this.baseUrl}/paciente`, this.mapToApi(partial)).pipe(
      switchMap(api => {
        if (!api?.id) return throwError(() => new Error('No se pudo crear el paciente.'));
        const createdId = api.id as number;
        const insuranceId = (partial.insurance as InsuranceI | undefined)?.id;
        return this.syncInsurance(createdId, insuranceId).pipe(
          switchMap(() => this.reloadPatient(createdId)),
          map(p => {
            if (!p) throw new Error('No se pudo obtener el paciente recién creado.');
            return p;
          })
        );
      })
    );
  }

  update(id: number, patch: Partial<PatientI>): Observable<PatientI | undefined> {
    return this.http.patch<PatientApi>(`${this.baseUrl}/paciente/${id}`, this.mapToApi(patch)).pipe(
      switchMap(api => {
        const insuranceId = (patch.insurance as InsuranceI | undefined)?.id;
        if (typeof insuranceId !== 'undefined') {
          return this.syncInsurance(api.id ?? id, insuranceId).pipe(
            switchMap(() => this.reloadPatient(id))
          );
        }
        return this.reloadPatient(id);
      }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/paciente/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => this._items$.next(this._items$.value.filter(p => p.id !== id))),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<PatientI | undefined> {
    return this.reloadPatient(id);
  }

  getByUserId(userId: number): Observable<PatientI | undefined> {
    return this.ensureLoaded().pipe(
      switchMap(() => this.items$.pipe(map(list => list.find(p => p.userId === userId))))
    );
  }

  private ensureLoaded(force = false): Observable<PatientI[]> {
    if (!force && this.loaded) {
      return of(this._items$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.fetchPatientsWithInsurance().pipe(
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

  private fetchPatientsWithInsurance(): Observable<PatientI[]> {
    return forkJoin({
      patients: this.http.get<PatientListResponse>(`${this.baseUrl}/pacientes`),
      relations: this.http.get<PatientInsuranceListResponse>(`${this.baseUrl}/patientinsurances`),
      insurances: this.fetchInsurances()
    }).pipe(
      map(({ patients, relations, insurances }) => this.mergePatientsWithInsurance(
        patients.patients ?? [],
        relations.patientInsurances ?? [],
        insurances
      ))
    );
  }

  private fetchPatientWithInsurance(id: number): Observable<PatientI | undefined> {
    return forkJoin({
      patient: this.http.get<PatientApi>(`${this.baseUrl}/paciente/${id}`),
      relations: this.http.get<PatientInsuranceListResponse>(`${this.baseUrl}/patientinsurances`),
      insurances: this.fetchInsurances()
    }).pipe(
      map(({ patient, relations, insurances }) => {
        if (!patient) return undefined;
        const rel = this.pickInsurance(relations.patientInsurances ?? [], id);
        return this.mapFromApi(patient, rel, this.toInsuranceMap(insurances));
      }),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  private reloadPatient(id: number): Observable<PatientI | undefined> {
    return this.fetchPatientWithInsurance(id).pipe(
      tap(patient => {
        if (patient) {
          this.upsert(patient);
        } else {
          this._items$.next(this._items$.value.filter(p => p.id !== id));
        }
      })
    );
  }

  private mergePatientsWithInsurance(patients: PatientApi[], relations: PatientInsuranceApi[], insurances: InsuranceI[]): PatientI[] {
    const grouped = this.groupInsuranceByPatient(relations);
    const insMap = this.toInsuranceMap(insurances);
    return patients.map(p => this.mapFromApi(p, grouped.get(p.id ?? 0), insMap));
  }

  private groupInsuranceByPatient(relations: PatientInsuranceApi[]): Map<number, PatientInsuranceApi | undefined> {
    const grouped = new Map<number, PatientInsuranceApi | undefined>();
    relations.forEach(rel => {
      if (rel.status !== 'ACTIVE') return;
      const prev = grouped.get(rel.patientId);
      if (!prev) {
        grouped.set(rel.patientId, rel);
        return;
      }
      const prevStart = prev.startDate ? new Date(prev.startDate).getTime() : 0;
      const currStart = rel.startDate ? new Date(rel.startDate).getTime() : 0;
      if (currStart >= prevStart) {
        grouped.set(rel.patientId, rel);
      }
    });
    return grouped;
  }

  private pickInsurance(relations: PatientInsuranceApi[], patientId: number): PatientInsuranceApi | undefined {
    return relations
      .filter(rel => rel.patientId === patientId && rel.status === 'ACTIVE')
      .sort((a, b) => {
        const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
        const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
        return bStart - aStart;
      })[0];
  }

  private upsert(patient: PatientI): void {
    if (!patient.id) return;
    const copy = [...this._items$.value];
    const idx = copy.findIndex(p => p.id === patient.id);
    if (idx === -1) {
      this._items$.next([patient, ...copy]);
      return;
    }
    copy[idx] = patient;
    this._items$.next(copy);
  }

  private mapFromApi(api: PatientApi, relation?: PatientInsuranceApi, insMap?: Map<number, InsuranceI>): PatientI {
    const insurance = relation
      ? insMap?.get(relation.insuranceId) ?? this.buildInsurance(relation)
      : api.insurance ?? (api.insuranceId ? insMap?.get(api.insuranceId) : undefined);
    return {
      ...api,
      insurance
    };
  }

  private buildInsurance(relation: PatientInsuranceApi): InsuranceI {
    return {
      id: relation.insuranceId,
      name: `Seguro #${relation.insuranceId}`,
      status: relation.status
    };
  }

  private toInsuranceMap(list: InsuranceI[]): Map<number, InsuranceI> {
    const map = new Map<number, InsuranceI>();
    list.forEach(ins => {
      if (typeof ins.id === 'number') {
        map.set(ins.id, ins);
      }
    });
    return map;
  }

  private mapToApi(payload: Partial<PatientI>): Partial<PatientApi> {
    const { insurance, ...rest } = payload;
    return {
      ...rest,
      insuranceId: insurance?.id
    };
  }

  private applyFilters(items: PatientI[], params?: PatientListParams): PatientI[] {
    let filtered = [...items];
    if (params?.status) filtered = filtered.filter(p => p.status === params.status);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(p => {
        const doc = p.docNumber?.toLowerCase() ?? '';
        const name = `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
        return doc.includes(q) || name.includes(q);
      });
    }

    return filtered.sort((a, b) => (a.firstName ?? '').localeCompare(b.firstName ?? ''));
  }

  private syncInsurance(patientId: number, insuranceId?: number | null): Observable<void> {
    if (!patientId) return of(void 0);
    if (!insuranceId) return this.disableAllInsurances(patientId);

    return this.http.get<PatientInsuranceListResponse>(`${this.baseUrl}/patientinsurances`).pipe(
      map(res => (res.patientInsurances ?? []).filter(rel => rel.patientId === patientId)),
      switchMap(list => {
        const today = this.today();
        const toDeactivate = list.filter(rel => rel.insuranceId !== insuranceId && rel.status === 'ACTIVE');
        const deactivate$ = toDeactivate.length
          ? forkJoin(toDeactivate.map(rel =>
              this.http.patch(`${this.baseUrl}/patientinsurance/${rel.patientId}/${rel.insuranceId}/logic`, {})
            )).pipe(map(() => void 0))
          : of(void 0);

        const current = list.find(rel => rel.insuranceId === insuranceId);
        const upsert$ = current
          ? this.http.patch(`${this.baseUrl}/patientinsurance/${patientId}/${insuranceId}`, {
              status: 'ACTIVE',
              startDate: today,
              endDate: null
            })
          : this.http.post(`${this.baseUrl}/patientinsurance`, {
              patientId,
              insuranceId,
              startDate: today,
              status: 'ACTIVE'
            });

        return deactivate$.pipe(
          switchMap(() => upsert$),
          map(() => void 0)
        );
      })
    );
  }

  private disableAllInsurances(patientId: number): Observable<void> {
    return this.http.get<PatientInsuranceListResponse>(`${this.baseUrl}/patientinsurances`).pipe(
      map(res => (res.patientInsurances ?? []).filter(rel => rel.patientId === patientId && rel.status === 'ACTIVE')),
      switchMap(list => {
        if (!list.length) return of(void 0);
        return forkJoin(list.map(rel =>
          this.http.patch(`${this.baseUrl}/patientinsurance/${rel.patientId}/${rel.insuranceId}/logic`, {})
        )).pipe(map(() => void 0));
      })
    );
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private fetchInsurances(): Observable<InsuranceI[]> {
    return this.insurancesSvc.list(undefined).pipe(take(1));
  }
}
