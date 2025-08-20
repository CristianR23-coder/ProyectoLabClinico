import { Component, OnDestroy } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [BreadcrumbModule, RouterModule, CardModule, ButtonModule],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content implements OnDestroy {
  items: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  private sub: Subscription;

  // Mapa de segmentos -> etiquetas (ajústalo a tus rutas reales)
  private labelMap: Record<string, string> = {
    'ordenes': 'Órdenes',
    'nueva': 'Nueva orden',
    'listado': 'Listado',
    'pendientes': 'Pendientes',
    'proceso': 'En proceso',
    'reportadas': 'Reportadas',

    'muestras': 'Muestras',
    'registrar': 'Registrar muestra',
    'todas': 'Listado de muestras',

    'resultados': 'Resultados',
    'ingresar': 'Ingresar por parámetro',
    'consultar': 'Consultar resultados',

    'reportes': 'Reportes',
    'orden': 'Informe por orden',
    'resumen': 'Resumen consolidado',

    'config': 'Configuración',
    'parametros': 'Parámetros de exámenes',
    'paneles': 'Paneles de exámenes',

    'admin': 'Administración',
    'pacientes': 'Pacientes',
    'medicos': 'Médicos',
    'aseguradoras': 'Aseguradoras'
  };

  constructor(private router: Router) {
    // Construye el breadcrumb cada vez que cambie la ruta
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.buildBreadcrumb());
    // inicial
    this.buildBreadcrumb();
  }

  private buildBreadcrumb(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    const segments = url.split('/').filter(Boolean); // sin vacíos y sin "/"
    let acc = '';

    this.items = segments.map(seg => {
      acc += '/' + seg;
      return {
        label: this.labelMap[seg] ?? this.capitalize(seg),
        routerLink: acc
      } as MenuItem;
    });
  }

  private capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
