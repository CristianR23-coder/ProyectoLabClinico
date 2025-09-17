import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, ButtonModule, DividerModule, TagModule],
  templateUrl: './repository.html'
})
export class RepositoryPage {
  // ===== Config editable =====
  app = {
    nombre: 'LIMS – Laboratorio Clínico',
    version: '1.3.0',
    estado: 'BETA',            // 'BETA' | 'ESTABLE'
    licencia: 'MIT',
    fecha: '2025-09-15',
    descripcion:
      'Sistema de información para laboratorio clínico: órdenes, muestras, resultados, validación y reportes.'
  };

  repoUrl   = 'https://github.com/CristianR23-coder/ProyectoLabClinico.git';
  issuesUrl = 'https://github.com/CristianR23-coder/ProyectoLabClinico/issues';
  docsUrl   = 'https://github.com/CristianR23-coder/ProyectoLabClinico/blob/main/README.md';

  caracteristicas = [
    { icon: 'pi pi-list-check',   titulo: 'Catálogos',     detalle: 'Exámenes, parámetros y paneles con orden visual.' },
    { icon: 'pi pi-database',     titulo: 'Resultados',    detalle: 'Captura numérica/texto, rangos y unidades.' },
    { icon: 'pi pi-check-circle', titulo: 'Validación',    detalle: 'Flujo de validar / rechazar con auditoría.' },
    { icon: 'pi pi-search',       titulo: 'Búsqueda',      detalle: 'Filtros por estado y búsqueda por texto.' },
    { icon: 'pi pi-table',        titulo: 'UI rápida',     detalle: 'PrimeNG + formularios reactivos (RxJS).' },
    { icon: 'pi pi-code',         titulo: 'API-ready',     detalle: 'Servicios mock listos para conectar backend.' }
  ];

  stack = [
    { titulo: 'Frontend', items: ['Angular 20+', 'PrimeNG', 'PrimeIcons', 'RxJS'] },
    { titulo: 'Estilos',  items: ['Tailwind', 'CSS utilitario'] },
    { titulo: 'Calidad',  items: ['TypeScript estricto', 'Reactive Forms'] }
  ];

  dev = {
    nombre: 'Cristian Ramirez Vega',
    rol: 'Full-Stack Developer',
    email: 'cdanielramirez@uniguajira.edu.co',
    github: 'https://github.com/CristianR23-coder',
    linkedin: '#'
  };
  // ==========================

  abrir(url: string) {
    window.open(url, '_blank', 'noopener');
  }

  estadoSeverity(): 'success' | 'info' {
    return this.app.estado === 'ESTABLE' ? 'success' : 'info';
  }
}
