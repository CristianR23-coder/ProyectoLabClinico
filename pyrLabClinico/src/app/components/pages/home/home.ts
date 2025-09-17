import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { ResultsService } from '../../../services/result-service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  private resultsSvc = inject(ResultsService);
  private router = inject(Router);

  // ===== KPIs (desde ResultsService) =====
  kpis$: Observable<{
    total: number;
    pendientes: number;
    validados: number;
    rechazados: number;
    fueraRango: number;
    updatedAt?: string | null;
  }> = this.resultsSvc.items$.pipe(
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

  // Tarjetas principales
  cards = [
    {
      title: 'Órdenes',
      sub: 'Gestión de órdenes médicas',
      icon: 'pi pi-folder',
      desc: 'Crea, busca y administra órdenes por paciente.',
      link: '/ordenes',
      cta: 'Ver órdenes'
    },
    {
      title: 'Muestras',
      sub: 'Registro y control de muestras',
      icon: 'pi pi-inbox',
      desc: 'Recepción, seguimiento y estado de muestras.',
      link: '/muestras',
      cta: 'Ver muestras'
    },
    {
      title: 'Resultados',
      sub: 'Consulta y validación',
      icon: 'pi pi-chart-line',
      desc: 'Captura, valida y entrega resultados.',
      link: '/resultados',
      cta: 'Ver resultados'
    }
  ];

  // Accesos rápidos
  quick = [
    { label: 'Exámenes',   icon: 'pi pi-book',       link: '/configuracion/examenes' },
    { label: 'Parámetros', icon: 'pi pi-sliders-h',  link: '/configuracion/parametros' },
    { label: 'Paneles',    icon: 'pi pi-th-large',   link: '/configuracion/paneles' },
    { label: 'Doctores',   icon: 'pi pi-user',       link: '/administracion/doctores' },
    { label: 'Pacientes',  icon: 'pi pi-users',      link: '/administracion/pacientes' },
  ];

  goResultados() { this.router.navigate(['/resultados']); }
}
