import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ResultsService } from '../../../services/result-service';
import { ResultI } from '../../../models/result-model';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type Dist = { PENDIENTE: number; VALIDADO: number; RECHAZADO: number };
type TrendPoint = { day: string; count: number };

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    ButtonModule, TagModule, TableModule, ChartModule, CardModule, TooltipModule
  ],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private resultsSvc = inject(ResultsService);

  // Datos crudos
  results$ = this.resultsSvc.items$;

  // KPIs
  totals$: Observable<{
    total: number;
    pendientes: number;
    validados: number;
    rechazados: number;
    fueraRango: number;
    updatedAt?: string | null;
  }> = this.results$.pipe(
    map(rows => {
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
    })
  );

  // Tabla: top pendientes
  pendientes$: Observable<ResultI[]> = this.results$.pipe(
    map(rows => rows.filter(r => r.resultState === 'PENDIENTE').slice(0, 8))
  );

  // Serie últimos 10 días
  last10Days$: Observable<TrendPoint[]> = this.results$.pipe(
    map(rows => {
      const byDay = new Map<string, number>();
      const today = new Date();
      for (let i = 9; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        byDay.set(this.yyyymmdd(d), 0);
      }
      for (const r of rows) {
        const key = r.dateResult ? this.yyyymmdd(new Date(r.dateResult)) : null;
        if (key && byDay.has(key)) byDay.set(key, (byDay.get(key) || 0) + 1);
      }
      return Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));
    })
  );

  // Distribución por estado
  dist$: Observable<Dist> = this.results$.pipe(
    map(rows => rows.reduce((acc, r) => {
      (acc as any)[r.resultState] = ((acc as any)[r.resultState] || 0) + 1;
      return acc;
    }, { PENDIENTE: 0, VALIDADO: 0, RECHAZADO: 0 } as Dist))
  );

  // ===== Charts: datos prearmados =====
  lineData$: Observable<any> = this.last10Days$.pipe(
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

  doughnutData$: Observable<any> = this.dist$.pipe(
    map(d => {
      const labels = ['Pendiente', 'Validado', 'Rechazado'];
      const data = [d.PENDIENTE, d.VALIDADO, d.RECHAZADO];
      const bg = [this.COLORS.PENDIENTE, this.COLORS.VALIDADO, this.COLORS.RECHAZADO];
      const hover = [this.COLORS.PENDIENTE_H, this.COLORS.VALIDADO_H, this.COLORS.RECHAZADO_H];

      return {
        labels,
        datasets: [{
          data,
          backgroundColor: bg,
          hoverBackgroundColor: hover,
          borderWidth: 0
        }]
      };
    })
  );


  // Opciones de chart
  lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit(): void { }

  goResultados() { this.router.navigate(['/resultados']); }

  private yyyymmdd(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // dentro de la clase Dashboard
  readonly COLORS = {
    PENDIENTE: '#f59e0b', // naranja  (amber-500)
    VALIDADO: '#22c55e', // verde    (green-500)
    RECHAZADO: '#ef4444', // rojo     (red-500)
    PENDIENTE_H: '#fbbf24', // hover naranja
    VALIDADO_H: '#4ade80', // hover verde
    RECHAZADO_H: '#f87171', // hover rojo
  };

}
