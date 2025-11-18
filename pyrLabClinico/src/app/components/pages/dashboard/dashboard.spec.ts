import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { DashboardService } from '../../../services/dashboard-service';

const dashboardServiceStub: Partial<DashboardService> = {
  totals$: of({ total: 0, pendientes: 0, validados: 0, rechazados: 0, fueraRango: 0, updatedAt: null }),
  pendientes$: of([]),
  lineData$: of({ labels: [], datasets: [] }),
  doughnutData$: of({ labels: [], datasets: [] }),
  COLORS: {
    PENDIENTE: '#f59e0b',
    VALIDADO: '#22c55e',
    RECHAZADO: '#ef4444',
    PENDIENTE_H: '#fbbf24',
    VALIDADO_H: '#4ade80',
    RECHAZADO_H: '#f87171'
  },
  refresh: () => of([])
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
