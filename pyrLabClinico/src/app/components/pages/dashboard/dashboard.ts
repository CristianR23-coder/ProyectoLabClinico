import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { DashboardService } from '../../../services/dashboard-service';

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
  private dashboardSvc = inject(DashboardService);

  readonly totals$ = this.dashboardSvc.totals$;
  readonly pendientes$ = this.dashboardSvc.pendientes$;
  readonly lineData$ = this.dashboardSvc.lineData$;
  readonly doughnutData$ = this.dashboardSvc.doughnutData$;
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

  refreshDashboard() {
    this.dashboardSvc.refresh().subscribe({
      error: err => console.error('[Dashboard] refresh failed', err)
    });
  }

}
