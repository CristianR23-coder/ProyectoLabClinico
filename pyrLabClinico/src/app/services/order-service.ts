// src/app/orders/service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

import { OrderI, OrderState } from '../models/order-model';
import { ExamI } from '../models/exam-model';
import { OrderItemI, OrderItemState } from '../models/order-item-model';

export interface OrderListParams {
  q?: string;
  state?: OrderState;
}

@Injectable({ providedIn: 'root' })
export class OrdersService {
  // ──────────────────────────────────────────────────────────────────────────────
  // Datos iniciales (mock)
  // ──────────────────────────────────────────────────────────────────────────────
  private readonly INITIAL: OrderI[] = [
    {
      id: 1001,
      patient: {
        id: 501,
        docType: 'CC',
        docNumber: '123456',
        firstName: 'Ana',
        lastName: 'Perez',
        status: 'ACTIVE'
      },
      doctor: {
        id: 80,
        docNumber: 'M-998',
        name: 'Dr. Lopez',
        status: 'ACTIVE'
      },
      insurance: {
        id: 7,
        name: 'Health Plus',
        nit: '900.123.456',
        status: 'ACTIVE'
      },
      orderDate: '2025-09-10T09:12:00Z',
      state: 'VALIDADA',
      priority: 'RUTINA',
      observations: 'Ayuno 8h.',
      status: 'ACTIVE',
      // Ítems (Orden–Examen)
      items: [
        { id: 9001, orderId: 1001, examId: 1, code: 'GLU', name: 'Glucosa', price: 15000, state: 'VALIDADO' },
        { id: 9002, orderId: 1001, examId: 2, code: 'COL', name: 'Colesterol Total', price: 30000, state: 'VALIDADO' }
      ],
      netTotal: 45000
    },
    {
      id: 1002,
      patient: {
        id: 502,
        docType: 'CC',
        docNumber: '789012',
        firstName: 'Luis',
        lastName: 'Gomez',
        status: 'ACTIVE'
      },
      doctor: {
        id: 81,
        docNumber: 'M-777',
        name: 'Dr. Ruiz',
        status: 'ACTIVE'
      },
      orderDate: '2025-09-10T15:45:00Z',
      state: 'EN_PROCESO',
      priority: 'URGENTE',
      observations: '',
      status: 'ACTIVE',
      items: [
        { id: 9001, orderId: 1001, examId: 1, code: 'GLU', name: 'Glucosa', price: 15000, state: 'VALIDADO' },
      ],
      netTotal: 0
    }
  ];

  // ──────────────────────────────────────────────────────────────────────────────
  // Estado interno
  // ──────────────────────────────────────────────────────────────────────────────
  private readonly _orders$ = new BehaviorSubject<OrderI[]>([...this.INITIAL]);
  readonly orders$: Observable<OrderI[]> = this._orders$.asObservable();

  // ──────────────────────────────────────────────────────────────────────────────
  // CRUD CABECERA (Orden)
  // ──────────────────────────────────────────────────────────────────────────────
  list(params?: OrderListParams): Observable<OrderI[]> {
    return this.orders$.pipe(delay(200), map(items => this.applyFilters(items, params)));
  }

  add(partial: Omit<OrderI, 'id'> & { id?: number }): Observable<OrderI> {
    const nextId = this.generateId();
    // Aseguramos items array
    const base: OrderI = {
      ...partial,
      id: partial.id ?? nextId,
      items: partial.items ?? []
    };
    // Recalcula el total por si no vino coherente
    const newOrder: OrderI = { ...base, netTotal: this.recalcTotal(base) };

    this._orders$.next([newOrder, ...this._orders$.value]);
    return of(newOrder).pipe(delay(120));
  }

  update(id: number, patch: Partial<OrderI>): Observable<OrderI | undefined> {
    const arr = this._orders$.value;
    const idx = arr.findIndex(o => o.id === id);

    if (idx === -1) {
      return of(undefined).pipe(delay(80));
    }

    const merged: OrderI = { ...arr[idx], ...patch };
    // Si cambian ítems o cualquier cosa, garantizamos el total correcto
    const updated: OrderI = { ...merged, netTotal: this.recalcTotal(merged) };

    const copy = [...arr];
    copy[idx] = updated;
    this._orders$.next(copy);

    return of(updated).pipe(delay(100));
  }

  remove(id: number): Observable<boolean> {
    const arr = this._orders$.value;
    const filtered = arr.filter(o => o.id !== id);
    const changed = filtered.length !== arr.length;
    if (changed) this._orders$.next(filtered);
    return of(changed).pipe(delay(80));
  }

  getById(id: number): Observable<OrderI | undefined> {
    return this.orders$.pipe(map(arr => arr.find(o => o.id === id)), delay(50));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // ÍTEMS (Orden–Examen)
  // ──────────────────────────────────────────────────────────────────────────────

  addItem(orderId: number, exam: ExamI, priceOverride?: number, state: OrderItemState = 'PENDIENTE'): Observable<OrderI | undefined> {
    const arr = this._orders$.value;
    const idx = arr.findIndex(o => o.id === orderId);
    if (idx === -1 || !exam?.id) return of(undefined).pipe(delay(50));

    const order = { ...arr[idx] };
    const items = order.items ? [...order.items] : [];

    // No duplicar mismo examen dentro de la orden
    if (items.some(it => it.examId === exam.id)) {
      return of(order).pipe(delay(60));
    }

    const newItem: OrderItemI = {
      id: this.generateItemId(),
      orderId,
      examId: exam.id,
      code: exam.code,
      name: exam.name,
      price: priceOverride != null ? priceOverride : (exam.priceBase ?? 0),
      state
    };

    order.items = [newItem, ...items];
    order.netTotal = this.recalcTotal(order);

    const copy = [...arr];
    copy[idx] = order;
    this._orders$.next(copy);

    return of(order).pipe(delay(80));
  }

  updateItem(orderId: number, itemId: number, patch: Partial<OrderItemI>): Observable<OrderI | undefined> {
    const arr = this._orders$.value;
    const idx = arr.findIndex(o => o.id === orderId);
    if (idx === -1) return of(undefined).pipe(delay(50));

    const order = { ...arr[idx] };
    const items = [...(order.items ?? [])];
    const i = items.findIndex(it => it.id === itemId);
    if (i === -1) return of(order).pipe(delay(50));

    // Si cambian examId/code/name desde fuera, se respetan (útil para “reemplazar” el examen)
    items[i] = { ...items[i], ...patch };
    order.items = items;
    order.netTotal = this.recalcTotal(order);

    const copy = [...arr];
    copy[idx] = order;
    this._orders$.next(copy);

    return of(order).pipe(delay(80));
  }

  /**
   * Elimina un ítem (examen) de la orden.
   */
  removeItem(orderId: number, itemId: number): Observable<OrderI | undefined> {
    const arr = this._orders$.value;
    const idx = arr.findIndex(o => o.id === orderId);
    if (idx === -1) return of(undefined).pipe(delay(50));

    const order = { ...arr[idx] };
    order.items = (order.items ?? []).filter(it => it.id !== itemId);
    order.netTotal = this.recalcTotal(order);

    const copy = [...arr];
    copy[idx] = order;
    this._orders$.next(copy);

    return of(order).pipe(delay(80));
  }

  // ──────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────────────────────────────────────
  private applyFilters(items: OrderI[], params?: OrderListParams): OrderI[] {
    let out = items;
    if (params?.state) {
      out = out.filter(r => r.state === params.state);
    }

    const q = params?.q?.trim().toLowerCase();
    if (q) {
      out = out.filter(r => {
        const idStr = String(r.id ?? '');
        const patient = r.patient
          ? `${r.patient.firstName} ${r.patient.lastName}`.toLowerCase()
          : '';
        const doc = r.patient?.docNumber?.toLowerCase() ?? '';
        return idStr.includes(q) || patient.includes(q) || doc.includes(q);
      });
    }
    return [...out].sort((a, b) => (b.orderDate ?? '').localeCompare(a.orderDate ?? ''));
  }

  private generateId(): number {
    const ids = this._orders$.value.map(o => o.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 1000;
    return max + 1;
  }

  private generateItemId(): number {
    const all = this._orders$.value.flatMap(o => o.items ?? []);
    const ids = all.map(i => i.id ?? 0);
    const max = ids.length ? Math.max(...ids) : 9000;
    return max + 1;
  }

  private recalcTotal(o: OrderI): number {
    return (o.items ?? []).reduce((acc, it) => acc + (it.price ?? 0), 0);
  }
}
