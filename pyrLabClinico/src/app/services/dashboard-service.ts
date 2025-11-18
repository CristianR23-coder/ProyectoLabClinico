import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResultI } from '../models/result-model';
import { ResultsService } from './result-service';

export type DashboardDistribution = { PENDIENTE: number; VALIDADO: number; RECHAZADO: number };
export type DashboardTrendPoint = { day: string; count: number };

export interface DashboardTotals {
  total: number;
  pendientes: number;
  validados: number;
  rechazados: number;
  fueraRango: number;
  updatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private resultsSvc = inject(ResultsService);

  readonly COLORS = {
    PENDIENTE: '#f59e0b',
    VALIDADO: '#22c55e',
    RECHAZADO: '#ef4444',
    PENDIENTE_H: '#fbbf24',
    VALIDADO_H: '#4ade80',
    RECHAZADO_H: '#f87171'
  };

  readonly results$ = this.resultsSvc.items$;

  readonly totals$: Observable<DashboardTotals> = this.results$.pipe(
    map(rows => this.computeTotals(rows))
  );

  readonly pendientes$: Observable<ResultI[]> = this.results$.pipe(
    map(rows => rows.filter(r => r.resultState === 'PENDIENTE').slice(0, 8))
  );

  readonly last10Days$: Observable<DashboardTrendPoint[]> = this.results$.pipe(
    map(rows => this.computeTrend(rows))
  );

  readonly dist$: Observable<DashboardDistribution> = this.results$.pipe(
    map(rows => this.computeDistribution(rows))
  );

  readonly lineData$ = this.last10Days$.pipe(
    map(points => ({
      labels: points.map(p => p.day),
      datasets: [{
        label: 'Resultados',
        data: points.map(p => p.count),
        tension: .35,
        fill: true
      }]
    }))
  );

  readonly doughnutData$ = this.dist$.pipe(
    map(d => ({
      labels: ['Pendiente', 'Validado', 'Rechazado'],
      datasets: [{
        data: [d.PENDIENTE, d.VALIDADO, d.RECHAZADO],
        backgroundColor: [this.COLORS.PENDIENTE, this.COLORS.VALIDADO, this.COLORS.RECHAZADO],
        hoverBackgroundColor: [this.COLORS.PENDIENTE_H, this.COLORS.VALIDADO_H, this.COLORS.RECHAZADO_H],
        borderWidth: 0
      }]
    }))
  );

  refresh(): Observable<ResultI[]> {
    return this.resultsSvc.refresh();
  }

  private computeTotals(rows: ResultI[]): DashboardTotals {
    let pendientes = 0, validados = 0, rechazados = 0, fueraRango = 0;
    let updatedAt: string | null = null;

    for (const r of rows) {
      if (r.resultState === 'PENDIENTE') pendientes++;
      else if (r.resultState === 'VALIDADO') validados++;
      else if (r.resultState === 'RECHAZADO') rechazados++;

      if (r.outRange === true) fueraRango++;
      if (r.dateResult && (!updatedAt || r.dateResult > updatedAt)) updatedAt = r.dateResult;
    }

    return { total: rows.length, pendientes, validados, rechazados, fueraRango, updatedAt };
  }

  private computeTrend(rows: ResultI[]): DashboardTrendPoint[] {
    const byDay = new Map<string, number>();
    const today = new Date();

    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      byDay.set(this.yyyymmdd(d), 0);
    }

    for (const r of rows) {
      const key = r.dateResult ? this.yyyymmdd(new Date(r.dateResult)) : null;
      if (key && byDay.has(key)) {
        byDay.set(key, (byDay.get(key) || 0) + 1);
      }
    }

    return Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));
  }

  private computeDistribution(rows: ResultI[]): DashboardDistribution {
    return rows.reduce(
      (acc, r) => {
        (acc as any)[r.resultState] = ((acc as any)[r.resultState] || 0) + 1;
        return acc;
      },
      { PENDIENTE: 0, VALIDADO: 0, RECHAZADO: 0 } as DashboardDistribution
    );
  }

  private yyyymmdd(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
