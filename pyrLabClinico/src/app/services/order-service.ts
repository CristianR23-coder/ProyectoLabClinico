// src/app/services/order-service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  forkJoin,
  from,
  of,
  throwError
} from 'rxjs';
import {
  catchError,
  concatMap,
  finalize,
  map,
  shareReplay,
  switchMap,
  take,
  tap,
  toArray
} from 'rxjs/operators';

import { OrderI, OrderState } from '../models/order-model';
import { PatientI } from '../models/patient-model';
import { DoctorI } from '../models/doctor-model';
import { InsuranceI } from '../models/insurance-model';
import { ExamI } from '../models/exam-model';
import { OrderItemI, OrderItemState } from '../models/order-item-model';
import { PatientsService } from './patient-service';
import { DoctorsService } from './doctor-service';
import { InsurancesService } from './insurance-service';

export interface OrderListParams {
  q?: string;
  state?: OrderState;
}

interface OrderListResponse { orders?: OrderApi[]; }
interface OrderItemListResponse { orderItems?: OrderItemApi[]; }

type Nullable<T> = T | null | undefined;

interface ReferenceMaps {
  patients: Map<number, PatientI>;
  doctors: Map<number, DoctorI>;
  insurances: Map<number, InsuranceI>;
}

interface OrderApi {
  id?: number;
  orderDate: string;
  state: OrderState;
  priority: 'RUTINA' | 'URGENTE';
  patientId: number;
  doctorId?: number | null;
  insuranceId?: number | null;
  netTotal: number;
  observations?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  patient?: Partial<PatientApi>;
  doctor?: Partial<DoctorApi>;
  insurance?: Partial<InsuranceApi>;
}

interface PatientApi {
  id: number;
  docType?: string | null;
  docNumber?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface DoctorApi {
  id: number;
  docNumber?: string | null;
  name?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface InsuranceApi {
  id: number;
  name?: string | null;
  nit?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

interface OrderItemApi {
  id: number;
  orderId: number;
  examId: number;
  code: string;
  name: string;
  price: number | string;
  state: OrderItemState;
  status: 'ACTIVE' | 'INACTIVE';
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private patientsSvc = inject(PatientsService);
  private doctorsSvc = inject(DoctorsService);
  private insurancesSvc = inject(InsurancesService);
  private readonly baseUrl = 'http://localhost:4000/api';

  private readonly _orders$ = new BehaviorSubject<OrderI[]>([]);
  readonly orders$ = this._orders$.asObservable();

  private loaded = false;
  private loading$?: Observable<OrderI[]>;

  constructor() {
    // Precarga inicial para que los consumidores de orders$ tengan datos reales.
    this.ensureDataLoaded().subscribe({
      error: err => console.error('[OrdersService] initial load failed', err)
    });
  }

  list(params?: OrderListParams, options?: { force?: boolean }): Observable<OrderI[]> {
    return this.ensureDataLoaded(options?.force).pipe(
      switchMap(() =>
        this.orders$.pipe(map(items => this.applyFilters(items, params)))
      )
    );
  }

  refresh(): Observable<OrderI[]> {
    return this.ensureDataLoaded(true);
  }

  add(partial: Omit<OrderI, 'id'> & { id?: number }): Observable<OrderI> {
    const payload = this.mapToApi(partial);
    const items = partial.items ?? [];

    return this.http.post<OrderApi>(`${this.baseUrl}/orden`, payload).pipe(
      switchMap(order => {
        if (!order?.id) {
          return throwError(() => new Error('No se pudo crear la orden'));
        }
        return this.persistItems(order.id, items).pipe(map(() => order.id));
      }),
      switchMap(orderId => this.reloadOrder(orderId!).pipe(
        map(ord => {
          if (!ord) throw new Error('La orden creada no pudo cargarse del backend');
          return ord;
        })
      ))
    );
  }

  update(id: number, patch: Partial<OrderI>): Observable<OrderI | undefined> {
    const payload = this.mapToApi(patch);
    if (Object.keys(payload).length === 0) {
      return of(this._orders$.value.find(o => o.id === id));
    }
    return this.http.patch<OrderApi>(`${this.baseUrl}/orden/${id}`, payload).pipe(
      switchMap(() => this.reloadOrder(id)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  remove(id: number): Observable<boolean> {
    return this.http.patch(`${this.baseUrl}/orden/${id}/logic`, {}).pipe(
      map(() => true),
      tap(() => this.removeFromCache(id)),
      catchError(err => {
        if (err?.status === 404) return of(false);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<OrderI | undefined> {
    return this.reloadOrder(id);
  }

  addItem(orderId: number, exam: ExamI, priceOverride?: number, state: OrderItemState = 'PENDIENTE'): Observable<OrderI | undefined> {
    if (!exam?.id) return of(undefined);

    const payload = this.mapItemToApi({
      orderId,
      examId: exam.id,
      code: exam.code,
      name: exam.name,
      price: priceOverride != null ? Number(priceOverride) : (exam.priceBase ?? 0),
      state,
    });

    return this.http.post<OrderItemApi>(`${this.baseUrl}/orderitem`, payload).pipe(
      switchMap(() => this.reloadOrder(orderId))
    );
  }

  updateItem(orderId: number, itemId: number, patch: Partial<OrderItemI>): Observable<OrderI | undefined> {
    return this.getById(orderId).pipe(
      take(1),
      switchMap(order => {
        const current = order?.items?.find(it => it.id === itemId);
        if (!current) return of(order);
        const merged: OrderItemI = { ...current, ...patch };
        const payload = this.mapItemToApi(merged, orderId);
        return this.http.patch<OrderItemApi>(`${this.baseUrl}/orderitem/${itemId}`, payload).pipe(
          switchMap(() => this.reloadOrder(orderId))
        );
      })
    );
  }

  removeItem(orderId: number, itemId: number): Observable<OrderI | undefined> {
    return this.http.patch(`${this.baseUrl}/orderitem/${itemId}/logic`, {}).pipe(
      switchMap(() => this.reloadOrder(orderId)),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  // Helpers ------------------------------------------------------------------
  private ensureDataLoaded(force = false): Observable<OrderI[]> {
    if (!force && this.loaded) {
      return of(this._orders$.value);
    }

    if (force) {
      this.loading$ = undefined;
      this.loaded = false;
    }

    if (!this.loading$) {
      this.loading$ = this.fetchOrdersWithItems().pipe(
        tap(list => {
          this._orders$.next(list);
          this.loaded = true;
        }),
        finalize(() => { this.loading$ = undefined; }),
        shareReplay(1)
      );
    }

    return this.loading$;
  }

  private fetchOrdersWithItems(): Observable<OrderI[]> {
    return forkJoin({
      orders: this.http.get<OrderListResponse>(`${this.baseUrl}/ordenes`),
      items: this.http.get<OrderItemListResponse>(`${this.baseUrl}/orderitems`)
    }).pipe(
      switchMap(({ orders, items }) =>
        this.fetchReferenceMaps().pipe(
          map(refs => {
            const grouped = this.groupItemsByOrder(items.orderItems ?? []);
            return (orders.orders ?? []).map(order =>
              this.mapFromApi(order, grouped.get(order.id ?? 0), refs)
            );
          })
        )
      )
    );
  }

  private fetchOrderWithItems(orderId: number): Observable<OrderI | undefined> {
    return forkJoin({
      order: this.http.get<OrderApi>(`${this.baseUrl}/orden/${orderId}`),
      items: this.http.get<OrderItemListResponse>(`${this.baseUrl}/orderitems`)
    }).pipe(
      switchMap(({ order, items }) =>
        this.fetchReferenceMaps().pipe(
          map(refs => {
            const related = (items.orderItems ?? []).filter(it => it.orderId === orderId);
            return this.mapFromApi(order, related, refs);
          })
        )
      ),
      catchError(err => {
        if (err?.status === 404) return of(undefined);
        return throwError(() => err);
      })
    );
  }

  private reloadOrder(orderId: number): Observable<OrderI | undefined> {
    return this.fetchOrderWithItems(orderId).pipe(
      tap(order => {
        if (order) {
          this.upsert(order);
        } else {
          this.removeFromCache(orderId);
        }
      })
    );
  }

  private mapFromApi(api: OrderApi, items?: OrderItemApi[] | OrderItemI[], refs?: ReferenceMaps): OrderI {
    const mappedItems = (items ?? []).map(it => this.mapItemFromApi(it));
    const fromApiTotal = Number(api.netTotal ?? 0);
    const computedTotal = this.recalcTotalFromItems(mappedItems);
    const netTotal = computedTotal || fromApiTotal;

    return {
      id: api.id,
      orderDate: api.orderDate ? new Date(api.orderDate).toISOString() : new Date().toISOString(),
      state: api.state,
      priority: api.priority,
      patient: refs?.patients.get(api.patientId) ?? this.mapPatient(api.patientId, api.patient as PatientApi | undefined),
      doctor: api.doctorId ? (refs?.doctors.get(api.doctorId) ?? this.mapDoctor(api.doctorId, api.doctor as DoctorApi | undefined)) : undefined,
      insurance: api.insuranceId ? (refs?.insurances.get(api.insuranceId) ?? this.mapInsurance(api.insuranceId, api.insurance as InsuranceApi | undefined)) : undefined,
      netTotal,
      observations: api.observations ?? undefined,
      status: api.status,
      items: mappedItems
    };
  }

  private mapPatient(patientId: number, api?: PatientApi): PatientI {
    if (!api && !patientId) {
      return {
        docType: 'CC',
        docNumber: '',
        firstName: '',
        lastName: '',
        status: 'ACTIVE'
      };
    }
    return {
      id: api?.id ?? patientId,
      docType: api?.docType ?? 'CC',
      docNumber: api?.docNumber ?? '',
      firstName: api?.firstName ?? '',
      lastName: api?.lastName ?? '',
      status: api?.status ?? 'ACTIVE'
    };
  }

  private mapDoctor(doctorId?: number | null, api?: DoctorApi): DoctorI | undefined {
    if (!doctorId && !api) return undefined;
    return {
      id: api?.id ?? doctorId ?? undefined,
      docNumber: api?.docNumber ?? '',
      name: api?.name ?? '—',
      status: api?.status ?? 'ACTIVE'
    };
  }

  private mapInsurance(insuranceId?: number | null, api?: InsuranceApi): InsuranceI | undefined {
    if (!insuranceId && !api) return undefined;
    return {
      id: api?.id ?? insuranceId ?? undefined,
      name: api?.name ?? '',
      nit: api?.nit ?? '',
      status: api?.status ?? 'ACTIVE'
    };
  }


  private mapToApi(order: Partial<OrderI>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (order.orderDate) payload['orderDate'] = order.orderDate;
    if (order.priority) payload['priority'] = order.priority;
    if (order.state) payload['state'] = order.state;
    if (typeof order.observations !== 'undefined') payload['observations'] = order.observations;
    if (typeof order.netTotal !== 'undefined') payload['netTotal'] = order.netTotal;
    if (order.status) payload['status'] = order.status;

    const patientId = (order.patient as PatientI | undefined)?.id;
    if (typeof patientId !== 'undefined') payload['patientId'] = patientId;

    const doctorId = (order.doctor as DoctorI | undefined)?.id;
    if (typeof doctorId !== 'undefined') payload['doctorId'] = doctorId;

    const insuranceId = (order.insurance as InsuranceI | undefined)?.id;
    if (typeof insuranceId !== 'undefined') payload['insuranceId'] = insuranceId;

    return payload;
  }

  private mapItemFromApi(api: OrderItemApi | OrderItemI): OrderItemI {
    const orderId = (api as OrderItemApi).orderId ?? (api as OrderItemI).orderId;
    return {
      id: api.id,
      orderId,
      examId: api.examId,
      code: api.code,
      name: api.name,
      price: Number(api.price ?? 0),
      state: api.state
    };
  }

  private mapItemToApi(item: Partial<OrderItemI>, forcedOrderId?: number): Record<string, unknown> {
    return {
      orderId: forcedOrderId ?? item.orderId,
      examId: item.examId,
      code: item.code,
      name: item.name,
      price: Number(item.price ?? 0),
      state: item.state ?? 'PENDIENTE',
      status: 'ACTIVE'
    };
  }

  private persistItems(orderId: number, items: OrderItemI[]): Observable<void> {
    if (!items.length) return of(void 0);
    return from(items).pipe(
      concatMap(item =>
        this.http.post<OrderItemApi>(
          `${this.baseUrl}/orderitem`,
          this.mapItemToApi(item, orderId)
        )
      ),
      toArray(),
      map(() => void 0)
    );
  }

  private upsert(order: OrderI): void {
    const copy = [...this._orders$.value];
    const idx = copy.findIndex(o => o.id === order.id);
    if (idx === -1) {
      this._orders$.next([order, ...copy]);
    } else {
      copy[idx] = order;
      this._orders$.next(copy);
    }
  }

  private removeFromCache(id: number): void {
    const filtered = this._orders$.value.filter(o => o.id !== id);
    this._orders$.next(filtered);
  }

  private groupItemsByOrder(items: OrderItemApi[]): Map<number, OrderItemI[]> {
    const grouped = new Map<number, OrderItemI[]>();
    items.forEach(item => {
      const key = item.orderId;
      const mapped = this.mapItemFromApi(item);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(mapped);
    });
    return grouped;
  }

  private applyFilters(items: OrderI[], params?: OrderListParams): OrderI[] {
    let out = [...items];
    if (params?.state) out = out.filter(r => r.state === params.state);

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const idStr = String(r.id ?? '');
        const patient = r.patient ? `${r.patient.firstName} ${r.patient.lastName}`.toLowerCase() : '';
        const doc = r.patient?.docNumber?.toLowerCase() ?? '';
        return idStr.includes(q) || patient.includes(q) || doc.includes(q);
      });
    }

    return out.sort((a, b) => (b.orderDate ?? '').localeCompare(a.orderDate ?? ''));
  }

  private recalcTotalFromItems(items: OrderItemI[]): number {
    return (items ?? []).reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  }

  private fetchReferenceMaps(): Observable<ReferenceMaps> {
    return forkJoin({
      patients: this.patientsSvc.list({ status: 'ACTIVE' }, { force: true }).pipe(take(1)),
      doctors: this.doctorsSvc.list({ status: 'ACTIVE' }, { force: true }).pipe(take(1)),
      insurances: this.insurancesSvc.list({ status: 'ACTIVE' }, { force: true }).pipe(take(1))
    }).pipe(
      map(({ patients, doctors, insurances }) => ({
        patients: this.toPatientMap(patients),
        doctors: this.toDoctorMap(doctors),
        insurances: this.toInsuranceMap(insurances)
      }))
    );
  }

  private toPatientMap(list: PatientI[]): Map<number, PatientI> {
    const map = new Map<number, PatientI>();
    list.forEach(p => {
      if (typeof p.id === 'number') map.set(p.id, p);
    });
    return map;
  }

  private toDoctorMap(list: DoctorI[]): Map<number, DoctorI> {
    const map = new Map<number, DoctorI>();
    list.forEach(d => {
      if (typeof d.id === 'number') map.set(d.id, d);
    });
    return map;
  }

  private toInsuranceMap(list: InsuranceI[]): Map<number, InsuranceI> {
    const map = new Map<number, InsuranceI>();
    list.forEach(ins => {
      if (typeof ins.id === 'number') map.set(ins.id, ins);
    });
    return map;
  }
}
