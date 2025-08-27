import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [PanelMenuModule, RouterModule, TooltipModule],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside implements OnInit {

  @Input() isAsideOpen = true;
  @Output() toggleAside = new EventEmitter<void>();   // 👈 emite al layout

  onToggle() { this.toggleAside.emit(); }

  @Input() collapsed = false;

  items: MenuItem[] = [
    {
      label: 'Órdenes',
      icon: 'pi pi-folder',
      items: [
        { label: 'Nueva orden', icon: 'pi pi-plus-circle', routerLink: ['/ordenes/nueva'], routerLinkActiveOptions: { exact: true } },
        {
          label: 'Listado', icon: 'pi pi-list',
          items: [
            { label: 'Pendientes', icon: 'pi pi-clock', routerLink: ['/ordenes/pendientes'], routerLinkActiveOptions: { exact: true } },
            { label: 'En proceso', icon: 'pi pi-sync', routerLink: ['/ordenes/en-proceso'], routerLinkActiveOptions: { exact: true } },
            { label: 'Reportadas', icon: 'pi pi-check-circle', routerLink: ['/ordenes/reportadas'], routerLinkActiveOptions: { exact: true } },
          ],
        },
      ],
    },
    {
      label: 'Muestras',
      icon: 'pi pi-inbox',
      items: [
        { label: 'Registrar muestra', icon: 'pi pi-pencil', routerLink: ['/muestras/registrar'] },
        { label: 'Listado de muestras', icon: 'pi pi-database', routerLink: ['/muestras/listado'] },
      ],
    },
    {
      label: 'Resultados',
      icon: 'pi pi-chart-line',
      items: [
        { label: 'Ingresar por parámetro', icon: 'pi pi-sliders-h', routerLink: ['/resultados/ingresar'] },
        { label: 'Consultar resultados', icon: 'pi pi-search', routerLink: ['/resultados/consultar'] },
      ],
    },
    {
      label: 'Reportes',
      icon: 'pi pi-file',
      items: [
        { label: 'Informe por orden', icon: 'pi pi-file', routerLink: ['/reportes/orden'] },
        { label: 'Resumen consolidado', icon: 'pi pi-chart-bar', routerLink: ['/reportes/consolidado'] },
      ],
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        { label: 'Parámetros de exámenes', icon: 'pi pi-sliders-h', routerLink: ['/configuracion/parametros'] },
        { label: 'Paneles de exámenes', icon: 'pi pi-th-large', routerLink: ['/configuracion/paneles'] },
      ],
    },
    {
      label: 'Administración',
      icon: 'pi pi-shield',
      items: [
        { label: 'Pacientes', icon: 'pi pi-users', routerLink: ['/admin/pacientes'] },
        { label: 'Médicos', icon: 'pi pi-user', routerLink: ['/admin/medicos'] },
        { label: 'Aseguradoras', icon: 'pi pi-briefcase', routerLink: ['/admin/aseguradoras'] },
      ],
    },
  ];

  itemsIconOnly: MenuItem[] = [];


  ngOnInit(): void {
  }

}
